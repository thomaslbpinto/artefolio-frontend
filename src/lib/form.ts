import type { ChangeEvent, Dispatch, KeyboardEvent, SetStateAction } from 'react';

type SupportedInputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type CreateInputChangeHandlerOptions<TErrors extends object> = {
  fieldErrorValue?: string | undefined;
  clearErrorKeys?: Array<keyof TErrors>;
};

export function createInputChangeHandler<
  TFormData extends object,
  TErrors extends object = Partial<Record<keyof TFormData, string>>,
>(
  setFormData: Dispatch<SetStateAction<TFormData>>,
  setErrors: Dispatch<SetStateAction<TErrors>>,
  options: CreateInputChangeHandlerOptions<TErrors> = {},
) {
  const { fieldErrorValue = '', clearErrorKeys = [] } = options;

  return (event: ChangeEvent<SupportedInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }) as TFormData);
    setErrors((prev) => {
      const nextErrors = { ...(prev as Record<string, string | undefined>) };
      nextErrors[name] = fieldErrorValue;

      clearErrorKeys.forEach((key) => {
        nextErrors[key as string] = undefined;
      });

      return nextErrors as TErrors;
    });
  };
}

export function preventFormSubmitOnEnter(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== 'Enter') {
    return;
  }

  const targetElement = event.target as HTMLElement;

  if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (targetElement.tagName === 'TEXTAREA' || targetElement.isContentEditable) {
    return;
  }

  if (targetElement.closest('button, a, [role="button"]')) {
    return;
  }

  if (targetElement instanceof HTMLInputElement) {
    const nonTextInputTypes = new Set(['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'range', 'color']);
    if (nonTextInputTypes.has(targetElement.type)) {
      return;
    }
  }

  if (!(targetElement instanceof HTMLInputElement || targetElement instanceof HTMLSelectElement)) {
    return;
  }

  event.preventDefault();
}
