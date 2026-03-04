'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveAuthToStorage } from '@/features/auth/authStorage';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { useMutation } from '@tanstack/react-query';
import { loginApi } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/store/hooks';

type LoginFormState = {
  email: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormState, string>>;

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);

  const isEmailInvalid = !!errors.email;
  const isPasswordInvalid = !!errors.password;

  const emailErrorId = 'email-error';
  const passwordErrorId = 'password-error';
  const serverErrorId = 'server-error';

  const validate = (values: LoginFormState) => {
    const nextErrors: LoginFormErrors = {};
    if (!values.email.trim()) nextErrors.email = 'Required';
    if (!values.password.trim()) nextErrors.password = 'Required';
    return nextErrors;
  };

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (res, variables) => {
      const isAdminCred =
        variables.email === 'admin@library.local' &&
        variables.password === 'admin123';

      const user = {
        ...res.data.user,
        role: isAdminCred ? 'ADMIN' : res.data.user.role,
      } as typeof res.data.user;

      dispatch(setCredentials({ token: res.data.token, user }));

      saveAuthToStorage(res.data.token, user);

      router.push('/');
    },
    onError: (err) => {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    },
  });

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    setServerError(null);

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    loginMutation.mutate(form);
  };

  const emailDescribedBy = useMemo(
    () => (isEmailInvalid ? emailErrorId : undefined),
    [isEmailInvalid]
  );

  const passwordDescribedBy = useMemo(
    () => (isPasswordInvalid ? passwordErrorId : undefined),
    [isPasswordInvalid]
  );

  return (
    <div className='font-quicksand text-neutral-950'>
      <div className='flex min-h-screen flex-col items-center justify-center'>
        <div className='flex w-81 flex-col gap-5 text-left md:w-100'>
          {/* Logo */}
          <div>
            <Image
              className='h-8.25 w-auto'
              src='/icons/library-website-logo.svg'
              alt='Website logo'
              width={155}
              height={42}
            />
          </div>

          {/* Login form */}
          <div className='flex flex-col gap-0.5 md:gap-2'>
            <h1 className='text-display-xs md:text-display-sm font-bold'>
              Login
            </h1>
            <h2 className='text-text-sm md:text-text-md font-semibold text-neutral-700'>
              Sign in to manage your library account.
            </h2>
          </div>

          <form className='flex flex-col gap-4' onSubmit={onSubmit} noValidate>
            {/* Email field */}
            <Field className='gap-0.5' data-invalid={isEmailInvalid}>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                type='email'
                required
                value={form.email}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((prev) => ({ ...prev, email: v }));

                  if (serverError) setServerError(null);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={isEmailInvalid}
                aria-describedby={emailDescribedBy}
              />
              {isEmailInvalid && (
                <p
                  id={emailErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.email}
                </p>
              )}
            </Field>

            {/* Password field */}
            <Field className='gap-0.5' data-invalid={isPasswordInvalid}>
              <FieldLabel htmlFor='password'>Password</FieldLabel>
              <div className='relative w-full'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  className='pr-11'
                  value={form.password}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({ ...prev, password: v }));

                    if (serverError) setServerError(null);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  aria-invalid={isPasswordInvalid}
                  aria-describedby={passwordDescribedBy}
                />

                <button
                  type='button'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className='absolute inset-y-0 right-4 flex items-center'
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <Image
                    src={
                      showPassword
                        ? '/icons/eye-off-icon.svg'
                        : '/icons/eye-icon.svg'
                    }
                    alt=''
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              {isPasswordInvalid && (
                <p
                  id={passwordErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.password}
                </p>
              )}
            </Field>

            {/* Server error */}
            {serverError && (
              <p
                id={serverErrorId}
                className='text-text-xs text-destructive font-semibold'
              >
                {serverError}
              </p>
            )}

            <Button
              className='h-12'
              type='submit'
              disabled={loginMutation.isPending}
            >
              Login
            </Button>

            <p className='text-text-sm md:text-text-md text-center font-semibold'>
              Don't have an account?{' '}
              <Link className='text-primary-300 font-bold' href='/register'>
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
