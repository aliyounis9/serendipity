import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { fetchPlaceSuggestions } from "@/api/client";
import { colors, textStyles } from "@/constants/theme";
import type { PlaceSuggestion } from "@/types/plan";

const MIN_QUERY_LENGTH = 3; // same minimum as the backend
const DEBOUNCE_MS = 300;

type LocationInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

type SearchResult =
  | { query: string; suggestions: PlaceSuggestion[] }
  | { query: string; failed: true };

// A text field that suggests San Francisco places while typing. Typing any
// location by hand still works, e.g. when suggestions are unavailable.
export function LocationInput({ value, onChange, placeholder, maxLength }: LocationInputProps) {
  const [result, setResult] = useState<SearchResult | null>(null);
  // The suggestion the user picked, so picking it doesn't start a new search.
  const [picked, setPicked] = useState<string | null>(null);

  const query = value.trim();
  const shouldSearch = query.length >= MIN_QUERY_LENGTH && query !== picked;

  useEffect(() => {
    if (!shouldSearch) return;

    let isCurrent = true;
    // Debounce: only search once typing has paused, instead of on every
    // keystroke. 
    const timer = setTimeout(() => {
      fetchPlaceSuggestions(query)
        .then((suggestions) => isCurrent && setResult({ query, suggestions }))
        .catch(() => isCurrent && setResult({ query, failed: true }));
    }, DEBOUNCE_MS);

    // Runs when the text changes again (or the screen closes): cancels the
    // waiting search, and makes any answer still on its way be ignored.
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, shouldSearch]);

  // Only show an answer for exactly the text in the field right now.
  const current = shouldSearch && result?.query === query ? result : null;

  function pick(suggestion: PlaceSuggestion) {
    const text = suggestion.address ? `${suggestion.name}, ${suggestion.address}` : suggestion.name;
    setPicked(text);
    onChange(text);
  }

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        maxLength={maxLength}
        style={styles.input}
      />

      {current && "failed" in current ? (
        <Text style={textStyles.hint}>Suggestions unavailable. Type the address.</Text>
      ) : null}

      {current && "suggestions" in current && current.suggestions.length > 0 ? (
        <View style={styles.list}>
          {current.suggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.name}-${index}`}
              accessibilityRole="button"
              onPress={() => pick(suggestion)}
              style={styles.item}
            >
              <Text style={styles.name}>{suggestion.name}</Text>
              {suggestion.address ? <Text style={textStyles.hint}>{suggestion.address}</Text> : null}
            </Pressable>
          ))}
          <Text style={styles.attribution}>Suggestions by Google</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  list: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  item: {
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 16,
    color: colors.text,
  },
  attribution: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    fontSize: 12,
    color: colors.textSubtle,
  },
});
