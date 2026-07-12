import { useState, type FormEvent } from 'react'
import { Modal } from '../feedback/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { createDriver } from '../../services/driverService'
import { useToast } from '../feedback/Toast'
import type { CreateDriverPayload } from '../../types/api'

const LICENSE_CATEGORIES = [
  { value: 'LMV', label: 'LMV — Light Motor Vehicle' },
  { value: 'HMV', label: 'HMV — Heavy Motor Vehicle' },
  { value: 'MCWG', label: 'MCWG — Motorcycle with Gear' },
  { value: 'TRANS', label: 'TRANS — Transport Vehicle' },
]

interface AddDriverModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormErrors {
  name?: string
  license_number?: string
  license_category?: string
  license_expiry_date?: string
  contact_number?: string
  safety_score?: string
  _form?: string
}

const EMPTY_FORM: CreateDriverPayload = {
  name: '',
  license_number: '',
  license_category: '',
  license_expiry_date: '',
  contact_number: '',
  safety_score: 80,
}

export function AddDriverModal({ open, onClose, onSuccess }: AddDriverModalProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState<CreateDriverPayload>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function handleClose() {
    setForm(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.license_number.trim()) e.license_number = 'License number is required.'
    if (!form.license_category) e.license_category = 'Category is required.'
    if (!form.license_expiry_date) e.license_expiry_date = 'Expiry date is required.'
    if (!form.contact_number.trim()) e.contact_number = 'Contact number is required.'
    if (form.safety_score < 0 || form.safety_score > 100)
      e.safety_score = 'Safety score must be between 0 and 100.'
    return e
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await createDriver(form)
      showToast('Driver added successfully.', 'success')
      handleClose()
      onSuccess()
    } catch (err: unknown) {
      // Show backend message inline, not just as toast
      const msg = err instanceof Error ? err.message : 'Failed to add driver.'
      setErrors({ _form: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add New Driver">
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div className="space-y-3">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="e.g. Arjun Mehta"
          />
          <Input
            label="License Number"
            required
            value={form.license_number}
            onChange={(e) => setForm({ ...form, license_number: e.target.value })}
            error={errors.license_number}
            placeholder="e.g. MH-1234567890"
          />
          <Select
            label="License Category"
            required
            value={form.license_category}
            onChange={(e) => setForm({ ...form, license_category: e.target.value })}
            options={LICENSE_CATEGORIES}
            error={errors.license_category}
          />
          <Input
            label="License Expiry Date"
            type="date"
            required
            value={form.license_expiry_date}
            onChange={(e) => setForm({ ...form, license_expiry_date: e.target.value })}
            error={errors.license_expiry_date}
          />
          <Input
            label="Contact Number"
            required
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
            error={errors.contact_number}
            placeholder="e.g. +91 98200 11111"
          />
          <Input
            label="Safety Score"
            type="number"
            min={0}
            max={100}
            value={String(form.safety_score)}
            onChange={(e) => setForm({ ...form, safety_score: Number(e.target.value) })}
            error={errors.safety_score}
            placeholder="0–100"
          />

          {/* Backend / form-level error */}
          {errors._form && (
            <div className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error font-medium">
              {errors._form}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-5 border-t border-base-300 mt-5">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" size="sm" loading={submitting}>
            Save Driver
          </Button>
        </div>
      </form>
    </Modal>
  )
}
