"use client";

import * as React from "react";
import { Check, Info } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface } from "@/components/ui/surface";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBank } from "@/lib/store";
import type { User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type FormKey = "name" | "email" | "phone" | "street" | "city";

const FIELDS: {
  key: FormKey;
  label: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
}[] = [
  { key: "name", label: "Full legal name", autoComplete: "name" },
  { key: "email", label: "Email address", type: "email", autoComplete: "email" },
  {
    key: "phone",
    label: "Mobile number",
    hint: "Used for security alerts and one-time codes.",
    type: "tel",
    autoComplete: "tel",
  },
  { key: "street", label: "Street address", autoComplete: "street-address" },
  { key: "city", label: "City, state and ZIP", autoComplete: "address-level2" },
];

const pick = (u: User): Record<FormKey, string> => ({
  name: u.name,
  email: u.email,
  phone: u.phone,
  street: u.street,
  city: u.city,
});

export default function PersonalInformationPage() {
  const user = useBank((s) => s.user);
  const updateProfile = useBank((s) => s.updateProfile);

  const [form, setForm] = React.useState(() => pick(user));
  const [errors, setErrors] = React.useState<Partial<Record<FormKey, string>>>({});
  const [saved, setSaved] = React.useState(false);

  const dirty = (Object.keys(form) as FormKey[]).some((k) => form[k].trim() !== user[k]);

  const set = (key: FormKey, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
  };

  const validate = () => {
    const next: Partial<Record<FormKey, string>> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full legal name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a 10-digit US mobile number.";
    if (form.street.trim().length < 4) next.street = "Enter your street address.";
    if (form.city.trim().length < 4) next.city = "Enter your city, state and ZIP code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
    });
    setSaved(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Personal information"
        subtitle="Keep your contact details current so we can reach you"
        back="/profile"
      />

      <form onSubmit={onSubmit} noValidate>
        <Surface index={0} className="p-5">
          <div className="space-y-4">
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint} error={errors[f.key]}>
                <Input
                  value={form[f.key]}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  onChange={(e) => set(f.key, e.target.value)}
                  aria-invalid={Boolean(errors[f.key])}
                />
              </Field>
            ))}
          </div>
        </Surface>

        <Surface index={1} variant="sunken" className="mt-4 flex gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          <p className="text-sm leading-relaxed text-ink-500">
            Changing your legal name or address on a US bank account needs supporting
            documents. Update the details here and our team will confirm what to send within
            one business day.
          </p>
        </Surface>

        {saved && (
          <Surface index={2} className="mt-4 flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-500">
              <Check className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-base font-semibold text-ink-900">Details saved</p>
              <p className="mt-0.5 text-sm text-ink-400">
                Updated {formatDate(new Date().toISOString(), "long")}.
              </p>
            </div>
          </Surface>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" disabled={!dirty} className="sm:min-w-40">
            Save changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!dirty}
            onClick={() => {
              setForm(pick(user));
              setErrors({});
              setSaved(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
