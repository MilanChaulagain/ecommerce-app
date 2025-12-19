# RelationsDesigner — Documentation

## Purpose

`RelationsDesigner` is an admin UI component placed below the form builder. It provides an MS-Access-like interface to visually create and manage relationships between the current form's fields and fields on other forms (tables). Relationships are stored in the form's `relationships` array and persisted when the main form Save/Update action is triggered.

## Location

- Component file: `frontend/components/form-builder/RelationsDesigner.tsx`
- Integrated in page: `frontend/app/admin/form-builder/page.tsx` (rendered below the builder)

## Props

- `currentFormSlug: string | null` — slug of the form currently being edited.
- `currentFields: FormField[]` — frontend field objects for the current form.
- `currentRelationships: FormRelationship[]` — in-memory relationships for the form.
- `addRelationship: (r: FormRelationship) => void` — handler provided by `useFormBuilder` to add a relationship to state.
- `removeRelationship: (fieldId: string) => void` — handler provided by `useFormBuilder` to remove a relationship by source field id.

## Internal state & effects

- `forms: FormSchema[]` — list of other forms/tables (loaded from the API).
- `targetFormSlug` — currently selected target form slug.
- `targetFields` — fields of the selected target form (loaded when `targetFormSlug` changes).
- `selectedSourceField`, `selectedTargetField` — selected source/target field ids.
- `validationError` — string used to display validation or user messages.

Two `useEffect` hooks fetch:
- the list of all forms on mount via `apiClient.forms.listForms()`
- the target form details and its fields when `targetFormSlug` changes via `apiClient.forms.getForm(slug)`

## Data flow and integration

1. `useFormBuilder` (hook) exposes `addRelationship` and `removeRelationship` which update the builder state: `state.relationships`.
2. `RelationsDesigner` calls `addRelationship(r)` to append a relationship object:

```ts
type FormRelationship = {
  field_id: string; // source field id in this form
  target_form_slug: string;
  display_field: string; // id of the field on the target table to show
}
```

3. These `relationships` are included in the payload sent to the backend when the page-level Save/Update button triggers `saveForm()` in `useFormBuilder`.

4. `removeRelationship(fieldId)` removes a relationship by source field id from `useFormBuilder` state.

## Key handlers (snippets)

- `handleCreate()` — validates selections, checks for existing relationship for the selected source field, and calls `addRelationship`:

```ts
if (!selectedSourceField) throw 'Choose source';
if (!targetFormSlug || !selectedTargetField) throw 'Choose target';
// if duplicate exists: show validation and require 'Replace'
addRelationship({ field_id: selectedSourceField, target_form_slug: targetFormSlug, display_field: selectedTargetField });
```

- `handleReplace()` — removes an existing relationship for the selected source, then adds the new one.

## UI behavior summary

- Left column: current form's fields (click to select source). Fields already linked show a `Linked` badge.
- Middle column: list of other forms (click to choose target table).
- Right column: fields of the selected target table (click to choose the target field).
- Actions: `Create Relationship` (disabled until both selections are made), `Replace Existing` (visible when a source already has a relationship), `Reset`.
- Existing relationships are shown in a table-like view with headers: Source Field, Target Table, Target Field, Actions (Edit / Remove). Edit preloads the selection to the top panel for quick changes.

## API endpoints used

- `apiClient.forms.listForms()` — GET list of forms (used to populate middle column).
- `apiClient.forms.getForm(slug)` — GET form details (used to load fields for a target form).
- The actual persistence occurs when `useFormBuilder.saveForm()` sends the full payload (including `relationships`) to the backend endpoints `createForm` or `updateForm`.

## Integration snippet (page)

In `frontend/app/admin/form-builder/page.tsx` the designer is included like:

```tsx
<RelationsDesigner
  currentFormSlug={state.formSlug}
  currentFields={state.fields}
  currentRelationships={state.relationships}
  addRelationship={addRelationship}
  removeRelationship={removeRelationship}
/>
```

## Manual test steps

1. Start backend and frontend servers.
2. Open the form-builder page with a slug: `/admin/form-builder?slug=<form-slug>`.
3. Verify top UI (FieldPalette, FormCanvas, FieldSettingsPanel) is visible and usable.
4. Scroll to the `RelationsDesigner` section below.
5. Select a source field (left), a target table (middle), and a target field (right).
6. Click `Create Relationship` — the new entry should appear in the Existing Relationships table.
7. Attempt to create another relationship for the same source — validation appears and `Replace Existing` is shown.
8. Click `Replace Existing` to replace the mapping, or `Remove` to delete it.
9. Click Save/Update at the top and confirm the network request payload includes the `relationships` array.

## Next improvements (ideas)

- Show a visual link/line connecting source and target fields for an even clearer relationship map.
- Add relationship type selection (one-to-many, many-to-one) and cardinality metadata.
- Add server-side validation when saving (ensure referenced target fields still exist).
- Add unit/integration tests for `RelationsDesigner` using React Testing Library and mocked `apiClient`.

---

File: `frontend/components/form-builder/RelationsDesigner.tsx`
