import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ObservationDetailPage } from '../pages/ObservationDetailPage';
import { ObservationsPage } from '../pages/ObservationsPage';
import {
  installFetchMock,
  TEST_ABUND_MAY,
  TEST_ABUND_NOV,
  TEST_ELEMENTS,
  TEST_FLUX_MAY,
  TEST_FLUX_NOV,
  TEST_OBS_DETAIL_MAY,
  TEST_OBS_DETAIL_NOV,
  TEST_OBSERVATIONS,
  TEST_SPECTRA_MAY,
  TEST_SPECTRA_NOV,
} from './fixtures';
import { renderWithProviders } from './renderWithProviders';

describe('Observation table and detail views', () => {
  it('renders observation table with accessible filters', async () => {
    installFetchMock({
      '/elements': TEST_ELEMENTS,
      '/observations': TEST_OBSERVATIONS,
    });

    renderWithProviders(<ObservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('CLASS_20191118')).toBeInTheDocument();
    });
    expect(screen.getByText('CLASS_20200529')).toBeInTheDocument();
    expect(screen.getByLabelText('Observation Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Element')).toBeInTheDocument();
    expect(screen.getByLabelText('Abundance Availability')).toBeInTheDocument();
  });

  it('renders CLASS_20191118 spectra switching, XSM presence, line fluxes, and withheld abundance notice', async () => {
    const user = userEvent.setup();
    installFetchMock({
      '/observations/CLASS_20191118': TEST_OBS_DETAIL_NOV,
      '/observations/CLASS_20191118/spectra': TEST_SPECTRA_NOV,
      '/observations/CLASS_20191118/abundances': TEST_ABUND_NOV,
      '/observations/CLASS_20191118/line-fluxes': TEST_FLUX_NOV,
    });

    renderWithProviders(
      <Routes>
        <Route path="/observations/:observationId" element={<ObservationDetailPage />} />
      </Routes>,
      ['/observations/CLASS_20191118'],
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'CLASS_20191118' })).toBeInTheDocument();
    });

    expect(screen.getByText('No Verified Elemental Abundance Records')).toBeInTheDocument();
    expect(
      screen.getByText(/181120\/R2_abundance\.txt lists 5 header elements/i),
    ).toBeInTheDocument();
    expect(screen.getByText('0.013')).toBeInTheDocument();

    const xsmTab = screen.getByRole('tab', { name: /Solar X-Ray Spectrum \(XSM\)/i });
    await user.click(xsmTab);
    expect(xsmTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders CLASS_20200529 abundances with asymmetric uncertainties and Ca-Ka line flux', async () => {
    installFetchMock({
      '/observations/CLASS_20200529': TEST_OBS_DETAIL_MAY,
      '/observations/CLASS_20200529/spectra': TEST_SPECTRA_MAY,
      '/observations/CLASS_20200529/abundances': TEST_ABUND_MAY,
      '/observations/CLASS_20200529/line-fluxes': TEST_FLUX_MAY,
    });

    renderWithProviders(
      <Routes>
        <Route path="/observations/:observationId" element={<ObservationDetailPage />} />
      </Routes>,
      ['/observations/CLASS_20200529'],
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'CLASS_20200529' })).toBeInTheDocument();
    });

    expect(screen.getByText('Derived Elemental Abundances (wt%)')).toBeInTheDocument();
    expect(screen.getByText('Ca-Ka')).toBeInTheDocument();
    expect(screen.getByText(/\(\+3 \/ -1\)/)).toBeInTheDocument();
  });
});
