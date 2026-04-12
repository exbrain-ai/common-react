import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider, createFixtureI18n, useI18n } from './i18n-context';

function TestConsumer() {
  const { locale, t } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">{t('hello.world')}</span>
      <span data-testid="interpolated">{t('greeting', { name: 'Alice', count: 3 })}</span>
    </div>
  );
}

describe('I18nProvider + useI18n', () => {
  it('provides locale and t to consumers', () => {
    const fixture = createFixtureI18n('es');
    render(
      <I18nProvider value={fixture}>
        <TestConsumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId('locale').textContent).toBe('es');
    expect(screen.getByTestId('translated').textContent).toBe('hello.world');
    expect(screen.getByTestId('interpolated').textContent).toBe(
      'greeting (name=Alice, count=3)',
    );
  });

  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useI18n must be used within an I18nProvider',
    );
  });
});

describe('createFixtureI18n', () => {
  it('defaults to en', () => {
    const fixture = createFixtureI18n();
    expect(fixture.locale).toBe('en');
  });

  it('returns key when no values', () => {
    const fixture = createFixtureI18n();
    expect(fixture.t('some.key')).toBe('some.key');
  });
});
