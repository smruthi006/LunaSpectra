import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { apiFetch, ApiClientError } from '../api/client';
import { HealthSchema } from '../api/schemas';
import { DashboardPage } from '../pages/DashboardPage';
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

describe('Dashboard states and Zod contract validation', () => {
  it('renders loading skeleton before backend resolves', () => {
    globalThis.fetch = () => new Promise(() => {});
    renderWithProviders(<DashboardPage />);
    expect(screen.getByLabelText('Loading dataset summary from backend')).toBeInTheDocument();
  });

  it('renders real dashboard metrics and elements on valid backend responses', async () => {
    installFetchMock({
      '/health': TEST_HEALTH,
      '/dataset/summary': TEST_SUMMARY,
      '/datasets': TEST_DATASETS,
      '/elements': TEST_ELEMENTS,
      '/map/availability': TEST_MAP_UNAVAILABLE,
      '/observations': TEST_OBSERVATIONS,
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Lunar Observations')).toBeInTheDocument();
    });
    expect(screen.getByText('26 / 4')).toBeInTheDocument();
    expect(screen.getByText('Origin: mission')).toBeInTheDocument();
    expect(screen.getByText('DOI: 10.17632/6mmd96j5bg.1')).toBeInTheDocument();
    expect(screen.getByText(/Geospatial Map: Unavailable \(false\)/i)).toBeInTheDocument();
  });

  it('displays contract validation error when dashboard receives malformed payload', async () => {
    installFetchMock({
      '/health': { unexpected: 'bad-shape' },
      '/dataset/summary': TEST_SUMMARY,
      '/datasets': TEST_DATASETS,
      '/elements': TEST_ELEMENTS,
      '/map/availability': TEST_MAP_UNAVAILABLE,
      '/observations': TEST_OBSERVATIONS,
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('API Contract Validation Error')).toBeInTheDocument();
    });
    expect(screen.getByText('SCHEMA_VALIDATION_FAILED (200)')).toBeInTheDocument();
  });

  it('throws ApiClientError with validation_error kind on Zod failure', async () => {
    installFetchMock({
      '/health': { status: 123 },
    });

    await expect(apiFetch('/health', HealthSchema)).rejects.toMatchObject({
      name: 'ApiClientError',
      kind: 'validation_error',
      code: 'SCHEMA_VALIDATION_FAILED',
    } satisfies Partial<ApiClientError>);
  });
});
