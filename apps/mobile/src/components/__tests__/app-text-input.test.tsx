import { render } from '@testing-library/react-native';

import { AppTextInput } from '../app-text-input';

describe('AppTextInput', () => {
  it('renders the label', async () => {
    const { getByText } = await render(<AppTextInput label="Adresse email" />);
    expect(getByText('Adresse email')).toBeTruthy();
  });

  it('renders the input with correct accessibilityLabel', async () => {
    const { getByLabelText } = await render(
      <AppTextInput label="Adresse email" />,
    );
    expect(getByLabelText('Adresse email')).toBeTruthy();
  });

  it('shows an error message when error prop is provided', async () => {
    const { getByText } = await render(
      <AppTextInput label="Email" error="Email invalide" />,
    );
    expect(getByText('Email invalide')).toBeTruthy();
  });

  it('does not show error when error prop is absent', async () => {
    const { queryByText } = await render(<AppTextInput label="Email" />);
    expect(queryByText('Email invalide')).toBeNull();
  });

  it('shows a hint when hint prop is provided', async () => {
    const { getByText } = await render(
      <AppTextInput
        label="Mot de passe"
        hint="Les mots de passe correspondent."
        hintVariant="success"
      />,
    );
    expect(getByText('Les mots de passe correspondent.')).toBeTruthy();
  });

  it('prefers error over hint when both are provided', async () => {
    const { getByText, queryByText } = await render(
      <AppTextInput
        label="Mot de passe"
        error="Les mots de passe ne correspondent pas."
        hint="Les mots de passe correspondent."
      />,
    );
    expect(getByText('Les mots de passe ne correspondent pas.')).toBeTruthy();
    expect(queryByText('Les mots de passe correspondent.')).toBeNull();
  });
});
