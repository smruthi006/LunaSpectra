import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../components/layout/AppShell';
import { AppRoutes } from '../routes/AppRoutes';
import {
  installFetchMock,
  TEST_DATASETS,
  TEST_ELEMENTS,
  TEST_HEALTH,
  TEST_MAP_UNAVAILABLE,
  TEST_OBSERVATIONS,
  TEST_SUMMARY,
} from './fixtures';
import { renderWithProviders } from './renderWithProviders';

describe('Application routing, layout, status, and accessibility', () => {
  it('renders persistent scope notice, backend-online indicator, and accessible navigation', async () => {
    installFetchMock({
      '/health': TEST_HEALTH,
      '/dataset/summary': TEST_SUMMARY,
    });

    renderWithProviders(
      <AppShell>
        <AppRoutes />
      </AppShell>,
      ['/'],
    );

    expect(
      screen.getByText(
        /Current release: genuine Chandrayaan-2 CLASS data from two observation dates/i,
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Backend connected')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Primary navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open navigation menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('heading', { level: 1, name: 'LunaSpectra' })).toBeInTheDocument();
  });

  it('shows backend-offline badge when /health fails', async () => {
    installFetchMock({
      '/health': new TypeError('Failed to fetch'),
      '/dataset/summary': new TypeError('Failed to fetch'),
    });

    renderWithProviders(
      <AppShell>
        <AppRoutes />
      </AppShell>,
      ['/'],
    );

    await waitFor(() => {
      expect(screen.getByText('Backend offline')).toBeInTheDocument();
    });
  });

  it('navigates between primary routes via sidebar links', async () => {
    const user = userEvent.setup();
    installFetchMock({
      '/health': TEST_HEALTH,
      '/datasets': TEST_DATASETS,
      '/dataset/summary': TEST_SUMMARY,
      '/elements': TEST_ELEMENTS,
      '/map/availability': TEST_MAP_UNAVAILABLE,
      '/observations': TEST_OBSERVATIONS,
    });

    renderWithProviders(
      <AppShell>
        <AppRoutes />
      </AppShell>,
      ['/'],
    );

    await user.click(screen.getByRole('link', { name: 'Methodology' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Analysis & Methodology' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Lunar Explorer' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Lunar Explorer' })).toBeInTheDocument();
    });
  });
});
