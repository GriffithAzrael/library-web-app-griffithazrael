'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { useMutation } from '@tanstack/react-query';
import { registerApi } from '@/features/auth/authApi';

type RegisterFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormState, string>>;

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (values: RegisterFormState) => {
    const nextErrors: RegisterFormErrors = {};

    if (!values.name.trim()) nextErrors.name = 'Text Helper';
    if (!values.email.trim()) nextErrors.email = 'Text Helper';
    if (!values.phone.trim()) nextErrors.phone = 'Text Helper';
    if (!values.password.trim()) nextErrors.password = 'Text Helper';
    if (!values.confirmPassword.trim())
      nextErrors.confirmPassword = 'Text Helper';

    if (
      values.password.trim() &&
      values.confirmPassword.trim() &&
      values.password !== values.confirmPassword
    ) {
      nextErrors.confirmPassword = 'Text Helper';
    }

    return nextErrors;
  };

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      router.push('/login');
    },
  });

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    registerMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
  };

  const nameErrorId = 'name-error';
  const emailErrorId = 'email-error';
  const phoneErrorId = 'phone-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirm-password-error';

  const nameDescribedBy = useMemo(
    () => (errors.name ? nameErrorId : undefined),
    [errors.name]
  );
  const emailDescribedBy = useMemo(
    () => (errors.email ? emailErrorId : undefined),
    [errors.email]
  );
  const phoneDescribedBy = useMemo(
    () => (errors.phone ? phoneErrorId : undefined),
    [errors.phone]
  );
  const passwordDescribedBy = useMemo(
    () => (errors.password ? passwordErrorId : undefined),
    [errors.password]
  );
  const confirmPasswordDescribedBy = useMemo(
    () => (errors.confirmPassword ? confirmPasswordErrorId : undefined),
    [errors.confirmPassword]
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

          {/* Register form */}
          <div className='flex flex-col gap-0.5 md:gap-2'>
            <div className='text-display-xs md:text-display-sm font-bold'>
              Register
            </div>
            <h2 className='text-text-sm md:text-text-md font-semibold text-neutral-700'>
              Create your account to start borrowing books.
            </h2>
          </div>

          <form className='flex flex-col gap-4' onSubmit={onSubmit} noValidate>
            {/* Name field */}
            <Field className='gap-0.5' data-invalid={!!errors.name}>
              <FieldLabel htmlFor='name'>Name</FieldLabel>
              <Input
                id='name'
                type='text'
                required
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((prev) => ({ ...prev, name: v }));
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                aria-invalid={!!errors.name}
                aria-describedby={nameDescribedBy}
              />
              {!!errors.name && (
                <p
                  id={nameErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.name}
                </p>
              )}
            </Field>

            {/* Email field */}
            <Field className='gap-0.5' data-invalid={!!errors.email}>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                type='email'
                required
                value={form.email}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((prev) => ({ ...prev, email: v }));
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={!!errors.email}
                aria-describedby={emailDescribedBy}
              />
              {!!errors.email && (
                <p
                  id={emailErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.email}
                </p>
              )}
            </Field>

            {/* Phone Number field */}
            <Field className='gap-0.5' data-invalid={!!errors.phone}>
              <FieldLabel htmlFor='phone'>Nomor Handphone</FieldLabel>
              <Input
                id='phone'
                type='tel'
                required
                value={form.phone}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((prev) => ({ ...prev, phone: v }));
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                aria-invalid={!!errors.phone}
                aria-describedby={phoneDescribedBy}
              />
              {!!errors.phone && (
                <p
                  id={phoneErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.phone}
                </p>
              )}
            </Field>

            {/* Password field */}
            <Field className='gap-0.5' data-invalid={!!errors.password}>
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
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  aria-invalid={!!errors.password}
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

              {!!errors.password && (
                <p
                  id={passwordErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.password}
                </p>
              )}
            </Field>

            {/* Confirm Password field */}
            <Field className='gap-0.5' data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor='confirmPassword'>
                Confirm Password
              </FieldLabel>
              <div className='relative w-full'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className='pr-11'
                  value={form.confirmPassword}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((prev) => ({ ...prev, confirmPassword: v }));
                    if (errors.confirmPassword)
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                  }}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={confirmPasswordDescribedBy}
                />

                <button
                  type='button'
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  className='absolute inset-y-0 right-4 flex items-center'
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  <Image
                    src={
                      showConfirmPassword
                        ? '/icons/eye-off-icon.svg'
                        : '/icons/eye-icon.svg'
                    }
                    alt=''
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              {!!errors.confirmPassword && (
                <p
                  id={confirmPasswordErrorId}
                  className='text-text-xs text-destructive font-semibold'
                >
                  {errors.confirmPassword}
                </p>
              )}
            </Field>

            {/* Error dari server register */}
            {registerMutation.isError && (
              <p className='text-text-xs text-destructive font-semibold'>
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
                  : 'Register failed'}
              </p>
            )}

            <Button
              className='h-12'
              type='submit'
              disabled={registerMutation.isPending}
            >
              Submit
            </Button>

            <p className='text-text-sm md:text-text-md text-center font-semibold'>
              Already have an account?{' '}
              <Link className='text-primary-300 font-bold' href='/login'>
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
