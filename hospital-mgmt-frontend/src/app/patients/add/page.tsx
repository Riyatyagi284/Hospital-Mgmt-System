"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  User,
  Phone,
  Heart,
  ShieldAlert,
  FileText,
  Upload,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import FormSection from "@/components/form/FormSection";
import FormField from "@/components/form/FormField";
import SelectInput from "@/components/form/SelectInput";
import TextArea from "@/components/form/TextArea";
import TextInput from "@/components/form/TextInput";

import { useCreatePatient } from "@/hooks/useCreatePatient";

import { CreatePatientDTO } from "@/types/api.types";

export default function AddPatient() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePatientDTO>();

  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const createPatientMutation = useCreatePatient();

  const dob = watch("dateOfBirth");

  // auto age calculate
  useEffect(() => {
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();

      setValue("age", currentYear - birthYear);
    }
  }, [dob, setValue]);

  const onSubmit = async (data: CreatePatientDTO) => {
    try {
      await createPatientMutation.mutateAsync(data);

      alert("Patient created successfully");

      reset();
      setServerErrors([]);
    } catch (error) {
      console.error(error);

      // alert("Failed to create patient");
      const backendErrors =
        error?.response?.data?.error?.map(
          (err: { msg: string }) => err.msg
        ) || ["Something went wrong"];

      setServerErrors(backendErrors);
    }
  };

  return (
    <PageContainer title="Add New Patient">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Patient Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the basic details of the patient
                </p>
              </div>
            </div>
            <Link
              href="/patients"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Patients
            </Link>
          </div>

          {/* Errors UI */}

          {
            serverErrors.length > 0 && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                  {serverErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )
          }

          {/* Form */}
          <div className="space-y-8">
            {/* Personal + Contact side by side on large */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <FormSection icon={User} title="Personal Information">
                <FormField label="First Name" required>
                  <TextInput placeholder="Enter first name"
                    {...register("firstName", {
                      required: true,
                    })}
                  />
                </FormField>
                <FormField label="Last Name" required>
                  <TextInput
                    placeholder="Enter last name"
                    {...register("lastName", {
                      required: true,
                    })}
                  />
                </FormField>
                <FormField label="Gender" required>
                  <SelectInput
                    placeholder="Select gender"
                    options={["MALE", "FEMALE", "OTHER"]}
                    {...register("gender")}
                  />
                </FormField>
                <FormField label="Date of Birth" required>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
                  />
                </FormField>
                <FormField label="Age">
                  <TextInput placeholder="Age will be calculated"
                    // disabled
                    {...register("age")}
                  />
                </FormField>
                <FormField label="Blood Group">
                  <SelectInput
                    placeholder="Select blood group"
                    // options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                    options={[
                      "A_POSITIVE",
                      "A_NEGATIVE",
                      "B_POSITIVE",
                      "B_NEGATIVE",
                      "AB_POSITIVE",
                      "AB_NEGATIVE",
                      "O_POSITIVE",
                      "O_NEGATIVE",
                    ]}
                    {...register("bloodGroup")}
                  />
                </FormField>
                <FormField label="Marital Status">
                  <SelectInput
                    placeholder="Select status"
                    {...register("maritalStatus")}
                    options={["Single", "Married", "Divorced", "Widowed"]}
                  />
                </FormField>
                <FormField label="Nationality">
                  <TextInput placeholder="Enter nationality" {...register("nationality")} />
                </FormField>
              </FormSection>

              {/* Contact */}
              <FormSection icon={Phone} title="Contact Information">
                <FormField label="Phone Number" required>
                  <TextInput placeholder="Enter phone number" {...register("phoneNumber")} />
                </FormField>
                <FormField label="Email Address">
                  <TextInput placeholder="Enter email address" {...register("emailAddress")} />
                </FormField>
                <FormField
                  label="Address"
                  required
                  className="sm:col-span-2 lg:col-span-3"
                >
                  <TextArea placeholder="Enter full address" {...register("address")} />
                </FormField>
                <FormField label="City" required>
                  <TextInput placeholder="Enter city"  {...register("city")} />
                </FormField>
                <FormField label="State" required>
                  <TextInput placeholder="Enter state"  {...register("state")} />
                </FormField>
                <FormField label="Pincode" required>
                  <TextInput placeholder="Enter pincode" {...register("pincode")} />
                </FormField>
              </FormSection>
            </div>

            {/* Medical + Emergency */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <FormSection icon={Heart} title="Medical Information">
                <FormField label="Allergies">
                  <TextArea placeholder="Enter allergies (if any)" {...register("allergies")} />
                </FormField>
                <FormField label="Chronic Diseases">
                  <TextArea placeholder="Enter any chronic diseases" {...register("chronicDiseases")} />
                </FormField>
                <FormField label="Height (cm)">
                  <TextInput placeholder="Enter height" {...register("height")} />
                </FormField>
                <FormField label="Weight (kg)">
                  <TextInput placeholder="Enter weight" {...register("weight")} />
                </FormField>
                <FormField label="Primary Doctor">
                  <SelectInput
                    placeholder="Select doctor"
                    options={[
                      "Dr. Amit Verma",
                      "Dr. Neha Singh",
                      "Dr. Rajesh Kumar",
                      "Dr. Pooja Mehta",
                    ]}
                  />
                </FormField>
              </FormSection>

              <FormSection icon={ShieldAlert} title="Emergency Contact">
                <FormField label="Contact Name" required>
                  <TextInput placeholder="Enter contact name" {...register("emergencyContactName")} />
                </FormField>
                {/* <FormField label="Relationship" required>
                  <SelectInput
                    placeholder="Select relationship"
                    {...register("relationship")}
                    options={[
                      "Spouse",
                      "Parent",
                      "Sibling",
                      "Child",
                      "Friend",
                      "Other",
                    ]}
                  />
                </FormField> */}
                <FormField label="Phone Number" required>
                  <TextInput placeholder="Enter phone number" {...register("emergencyContactPhone")} />
                </FormField>
                <FormField label="Address">
                  <TextInput placeholder="Enter address" {...register("emergencyContactAddress")} />
                </FormField>
              </FormSection>
            </div>

            {/* Additional */}
            <FormSection icon={FileText} title="Additional Information">
              {/* <FormField label="Upload Profile Photo">
                <div className="flex h-28 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 cursor-pointer">
                  <Upload className="mb-1 h-6 w-6 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload photo
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              </FormField> */}
              <div>
                <FormField label="ID Type">
                  <SelectInput
                    placeholder="Select ID Type"
                    {...register("idProofType")}
                    options={["Aadhaar", "PAN", "Passport", "Driving License"]}
                  />
                </FormField>
                <div className="mt-4">
                  <FormField label="ID Proof Number">
                    <TextInput placeholder="Enter ID proof number" {...register("idProofNumber")} />
                  </FormField>
                </div>
              </div>
              <FormField label="Notes">
                <TextArea placeholder="Enter any additional notes" {...register("notes")} />
              </FormField>
            </FormSection>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
              <button onClick={() => reset()} className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>

              <button
                type="submit"
                disabled={createPatientMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Save className="h-4 w-4" />
                {createPatientMutation.isPending
                  ? "Saving..."
                  : "Save Patient"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
