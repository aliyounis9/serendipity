import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { ApiError, createPlan } from "@/api/client";
import { Button } from "@/components/button";
import { DateTimeInput } from "@/components/date-time-input";
import { LocationInput } from "@/components/location-input";
import { OptionRow } from "@/components/option-row";
import { Screen } from "@/components/screen";
import { colors, textStyles } from "@/constants/theme";
import {
  apiFieldToFormField,
  formatDateTime,
  EARLIEST_START,
  LATEST_START,
  LIMITS,
  parsePlanDateTime,
  todayInSanFrancisco,
  validatePlanForm,
  type PlanForm,
  type PlanFormErrors,
} from "@/plans/form";
import type { Plan } from "@/types/plan";

const GROUP_SIZES = [2, 3, 4, 5];

export default function CreatePlanScreen() {
  const [form, setForm] = useState<PlanForm>(() => ({
    title: "",
    description: "",
    location: "",
    date: todayInSanFrancisco(),
    time: "",
    maxParticipants: null,
  }));
  const [errors, setErrors] = useState<PlanFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<Plan | null>(null);

  function update(changes: Partial<PlanForm>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  async function submit() {
    setSubmitError(null);
    const result = validatePlanForm(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      setCreated(await createPlan(result.plan));
    } catch (caught) {
      if (caught instanceof ApiError && caught.kind === "validation") {
        // Show the server's validation messages next to the matching fields.
        const serverErrors: PlanFormErrors = {};
        for (const [field, message] of Object.entries(caught.fieldErrors)) {
          const formField = apiFieldToFormField(field);
          if (formField) serverErrors[formField] = message;
        }
        setErrors(serverErrors);
      }
      setSubmitError(caught instanceof ApiError ? caught.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (created) {
    return (
      <Screen title="Plan created">
        <Text style={textStyles.heading}>Your plan is live</Text>
        <Text style={textStyles.body}>
          {created.title} · {formatDateTime(created.starts_at)}
        </Text>
        <Text style={textStyles.body}>Others can now find it in Explore Plans.</Text>
        <Button
          title="View plan"
          onPress={() => router.replace({ pathname: "/plans/[id]", params: { id: created.id } })}
        />
        <Button title="Explore plans" variant="secondary" onPress={() => router.replace("/plans")} />
      </Screen>
    );
  }

  const preview = parsePlanDateTime(form.date, form.time);

  return (
    <Screen title="Create a Plan">
      <Text style={textStyles.heading}>Bring people together</Text>

      <Field label="Title" error={errors.title}>
        <Input
          value={form.title}
          onChangeText={(title) => update({ title })}
          placeholder="Sunset walk at Crissy Field"
          maxLength={LIMITS.title}
        />
      </Field>

      <Field label="Description (optional)" error={errors.description}>
        <Input
          value={form.description}
          onChangeText={(description) => update({ description })}
          placeholder="What you'll do, what to bring"
          maxLength={LIMITS.description}
          multiline
          style={styles.multiline}
        />
      </Field>

      <Field label="Location" error={errors.location}>
        <LocationInput
          value={form.location}
          onChange={(location) => update({ location })}
          placeholder="Search for a place, e.g. Ferry Building"
          maxLength={LIMITS.location}
        />
      </Field>

      <View style={styles.row}>
        <Field label="Date" error={errors.date} style={styles.rowItem}>
          <DateTimeInput
            mode="date"
            value={form.date}
            onChange={(date) => update({ date })}
            min={todayInSanFrancisco()}
          />
        </Field>
        <Field label="Time" error={errors.time} style={styles.rowItem}>
          <DateTimeInput
            mode="time"
            value={form.time}
            onChange={(time) => update({ time })}
            min={EARLIEST_START}
            max={LATEST_START}
            stepMinutes={15}
          />
        </Field>
      </View>
      <Text style={textStyles.hint}>
        San Francisco time · plans can start {EARLIEST_START}–{LATEST_START}
      </Text>
      {preview ? <Text style={textStyles.hint}>Starts {formatDateTime(preview)}</Text> : null}

      <Field label="Group size, including you" error={errors.maxParticipants}>
        {GROUP_SIZES.map((size) => (
          <OptionRow
            key={size}
            kind="radio"
            label={`${size} people`}
            selected={form.maxParticipants === size}
            onPress={() => update({ maxParticipants: size })}
          />
        ))}
      </Field>

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      <Button
        title={isSubmitting ? "Creating…" : "Create plan"}
        disabled={isSubmitting}
        onPress={submit}
      />
    </Screen>
  );
}

function Field({
  label,
  error,
  style,
  children,
}: {
  label: string;
  error?: string;
  style?: object;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.textSubtle,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  error: {
    fontSize: 14,
    color: colors.notice,
  },
});
