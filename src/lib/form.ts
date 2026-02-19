import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

export function createInputChangeHandler<T extends Record<string, string>>(
  setFormData: Dispatch<SetStateAction<T>>,
  setErrors: Dispatch<SetStateAction<Partial<Record<keyof T, string>>>>,
) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };
}
