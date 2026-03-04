'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { saveAuthToStorage } from '@/features/auth/authStorage';
import type { AuthUser } from '@/features/auth/types';
import { apiFetch } from '@/lib/api';

type MeProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type MeResponse = {
  success: boolean;
  message: string;
  data: {
    profile: MeProfile;
  };
};

type UpdateMeResponse = {
  success: boolean;
  message: string;
  data: {
    profile: MeProfile;
  };
};

export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const { token, hydrated, user: authUser } = useAppSelector((s) => s.auth);
  const isLoggedIn = hydrated && !!token;

  // guard
  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.push('/login');
  }, [hydrated, token, router]);

  const meQuery = useQuery({
    queryKey: ['me', token],
    enabled: isLoggedIn,
    queryFn: () =>
      apiFetch<MeResponse>('/api/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }),
  });

  const profile = meQuery.data?.data.profile;

  // ===== Edit state =====
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // init form values from fetched profile (only when not editing)
  useEffect(() => {
    if (!profile) return;
    if (isEdit) return;

    setName(profile.name ?? '');
    setPhone(profile.phone ?? '');
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setLocalError(null);
  }, [profile, isEdit]);

  // cleanup object url
  useEffect(() => {
    return () => {
      if (photoPreviewUrl?.startsWith('blob:'))
        URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const profileSrc = useMemo(() => {
    if (photoPreviewUrl) return photoPreviewUrl;

    if (profile?.profilePhoto && profile.profilePhoto.trim().length > 0) {
      return profile.profilePhoto;
    }
    return '/images/placeholder-profile-pic.png';
  }, [photoPreviewUrl, profile?.profilePhoto]);

  const isProfileDataUrl =
    typeof profileSrc === 'string' &&
    (profileSrc.startsWith('data:') || profileSrc.startsWith('blob:'));

  // ===== PATCH /api/me (multipart/form-data) =====
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Not authenticated');

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');

      const fd = new FormData();
      fd.append('name', name);
      fd.append('phone', phone);
      if (photoFile) fd.append('profilePhoto', photoFile);

      const res = await fetch(`${baseUrl}/api/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const json = (await res
        .json()
        .catch(() => null)) as UpdateMeResponse | null;

      if (!res.ok) throw new Error(json?.message ?? 'Failed to update profile');
      if (!json?.success)
        throw new Error(json?.message ?? 'Failed to update profile');

      return json;
    },

    onMutate: async () => {
      if (!token) return;

      await queryClient.cancelQueries({ queryKey: ['me', token] });

      const prevMe = queryClient.getQueryData<MeResponse>(['me', token]);
      const prevAuth = authUser;

      // optimistic update query cache
      if (prevMe?.data?.profile) {
        const optimisticPhoto =
          photoPreviewUrl ?? prevMe.data.profile.profilePhoto ?? null;

        queryClient.setQueryData<MeResponse>(['me', token], {
          ...prevMe,
          data: {
            ...prevMe.data,
            profile: {
              ...prevMe.data.profile,
              name,
              phone,
              profilePhoto: optimisticPhoto,
            },
          },
        });

        // optimistic update redux + storage (agar header ikut berubah)
        if (prevAuth) {
          const nextAuthUser: AuthUser = {
            ...prevAuth,
            name,
            phone,
            profilePhoto: optimisticPhoto,
          };
          dispatch(setCredentials({ token, user: nextAuthUser }));
          saveAuthToStorage(token, nextAuthUser);
        }
      }

      return { prevMe, prevAuth };
    },

    onError: (_err, _vars, ctx) => {
      if (!token) return;

      // rollback query
      if (ctx?.prevMe) queryClient.setQueryData(['me', token], ctx.prevMe);

      // rollback auth
      if (ctx?.prevAuth) {
        dispatch(setCredentials({ token, user: ctx.prevAuth }));
        saveAuthToStorage(token, ctx.prevAuth);
      }
    },

    onSuccess: (res) => {
      if (!token) return;

      const nextProfile = res.data.profile;

      // set query data from server
      queryClient.setQueryData<MeResponse>(['me', token], {
        success: true,
        message: 'OK',
        data: { profile: nextProfile },
      });

      // update redux + storage from server (final photo URL etc)
      if (authUser) {
        const nextAuthUser: AuthUser = {
          ...authUser,
          name: nextProfile.name,
          phone: nextProfile.phone,
          profilePhoto: nextProfile.profilePhoto,
        };
        dispatch(setCredentials({ token, user: nextAuthUser }));
        saveAuthToStorage(token, nextAuthUser);
      }

      // exit edit mode
      setIsEdit(false);
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setLocalError(null);
    },

    onSettled: () => {
      if (!token) return;
      queryClient.invalidateQueries({ queryKey: ['me', token] });
    },
  });

  const enterEditMode = () => {
    setLocalError(null);
    updateMutation.reset();
    setIsEdit(true);
  };

  const cancelEdit = () => {
    // rollback local form ke data terbaru dari query
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
    }

    if (photoPreviewUrl?.startsWith('blob:'))
      URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);

    setLocalError(null);
    updateMutation.reset();
    setIsEdit(false);
  };

  const saveEdit = () => {
    setLocalError(null);

    // validasi sederhana
    if (!name.trim() || !phone.trim()) {
      setLocalError('Please complete the form');
      return;
    }

    updateMutation.mutate();
  };

  return (
    <main className='flex flex-col bg-white px-4 pt-20 pb-4 md:ml-55 md:w-139.25 md:px-0 md:pt-30 md:pb-27.5'>
      {/* Container */}
      <div className='flex flex-col gap-3.75 md:gap-6'>
        {/* Menu Buttons (when clicked, each will redirect to a page) */}
        <div className='rounded-radius-2xl flex gap-2 bg-neutral-100 p-2'>
          <Button className='md:text-text-md h-10 flex-1' variant={'menu'}>
            Profile
          </Button>
          <Button
            className='md:text-text-md h-10 flex-1 bg-transparent font-medium'
            variant={'menu'}
          >
            Borrowed List
          </Button>
          <Button
            className='md:text-text-md h-10 flex-1 bg-transparent font-medium'
            variant={'menu'}
          >
            Reviews
          </Button>
        </div>

        {/* Profile details */}
        <h2 className='text-display-xs md:text-display-sm font-bold'>
          Profile
        </h2>

        {/* Profile container */}
        <div className='rounded-radius-2xl flex flex-col gap-4 bg-white p-4 shadow-[0px_0px_20px] shadow-[#cbcaca]/25 md:gap-6 md:p-5'>
          <div className='flex flex-col gap-2 md:gap-3'>
            <div className='size-16'>
              {/* Hidden file input for photo */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg,image/jpg,image/gif,image/webp'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // validasi sederhana max 5MB
                  if (file.size > 5 * 1024 * 1024) return;

                  setPhotoFile(file);

                  const url = URL.createObjectURL(file);
                  setPhotoPreviewUrl(url);
                }}
              />

              {isEdit ? (
                <button
                  type='button'
                  className='size-16'
                  onClick={() => fileInputRef.current?.click()}
                  aria-label='Change profile photo'
                >
                  <Image
                    className='size-16 rounded-full object-cover'
                    src={profileSrc}
                    alt='Profile picture'
                    width={1200}
                    height={1200}
                    unoptimized={isProfileDataUrl}
                  />
                </button>
              ) : (
                <Image
                  className='size-16 rounded-full object-cover'
                  src={profileSrc}
                  alt='Profile picture'
                  width={1200}
                  height={1200}
                  unoptimized={isProfileDataUrl}
                />
              )}
            </div>

            <div className='text-text-sm md:text-text-md flex justify-between font-medium'>
              <div>Name</div>
              <div className='font-bold'>
                {meQuery.isLoading ? (
                  '...'
                ) : isEdit ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full bg-transparent text-right font-bold outline-none'
                  />
                ) : (
                  (profile?.name ?? '-')
                )}
              </div>
            </div>

            <div className='text-text-sm md:text-text-md flex justify-between font-medium'>
              <div>Email</div>
              <div className='font-bold'>
                {meQuery.isLoading ? '...' : (profile?.email ?? '-')}
              </div>
            </div>

            <div className='text-text-sm md:text-text-md flex justify-between font-medium'>
              <div>Nomor Handphone</div>
              <div className='font-bold'>
                {meQuery.isLoading ? (
                  '...'
                ) : isEdit ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='w-full bg-transparent text-right font-bold outline-none'
                  />
                ) : (
                  (profile?.phone ?? '-')
                )}
              </div>
            </div>

            {meQuery.isError && (
              <p className='text-text-xs text-destructive font-semibold'>
                {meQuery.error instanceof Error
                  ? meQuery.error.message
                  : 'Failed to load profile'}
              </p>
            )}

            {localError && (
              <p className='text-text-xs text-destructive font-semibold'>
                {localError}
              </p>
            )}

            {updateMutation.isError && (
              <p className='text-text-xs text-destructive font-semibold'>
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'Failed to update profile'}
              </p>
            )}
          </div>

          {/* Buttons */}
          {!isEdit ? (
            <Button
              className='h-11'
              onClick={enterEditMode}
              disabled={meQuery.isLoading}
            >
              Update Profile
            </Button>
          ) : (
            <div className='flex gap-3'>
              <Button
                className='h-11 flex-1'
                variant={'white'}
                onClick={cancelEdit}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className='h-11 flex-1'
                onClick={saveEdit}
                disabled={updateMutation.isPending}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
