import { fireEvent, render } from '@testing-library/react-native';

import { AppButton } from '../app-button';

describe('AppButton', () => {
  it('renders its title', async () => {
    const { getByText } = await render(
      <AppButton title="Se connecter" onPress={() => {}} />,
    );
    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <AppButton title="Se connecter" onPress={onPress} />,
    );
    fireEvent.press(getByText('Se connecter'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <AppButton title="Se connecter" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText('Se connecter'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loadingTitle when loading', async () => {
    const { getByText, queryByText } = await render(
      <AppButton
        title="Se connecter"
        loadingTitle="Connexion…"
        onPress={() => {}}
        loading
      />,
    );
    expect(getByText('Connexion…')).toBeTruthy();
    expect(queryByText('Se connecter')).toBeNull();
  });

  it('does not call onPress when loading', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <AppButton title="Se connecter" onPress={onPress} loading />,
    );
    fireEvent.press(getByText('Se connecter'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks the button as disabled for accessibility when disabled', async () => {
    const { getByRole } = await render(
      <AppButton title="Se connecter" onPress={() => {}} disabled />,
    );
    expect(getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });
});
