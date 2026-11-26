import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ComparisonPage } from '../pages/ComparisonPage';
import { DataSourcesPage } from '../pages/DataSourcesPage';
import { LunarExplorerPage } from '../pages/LunarExplorerPage';
import {
  installFetchMock,
  TEST_DATASETS,
  TEST_MAP_UNAVAILABLE,
  TEST_OBS_DETAIL_MAY,
  TEST_OBS_DETAIL_NOV,
  TEST_OBSERVATIONS,
  TEST_SUMMARY,
} from './fixtures';
import { renderWithProviders } from './renderWithProviders';

describe('Comparison, Lunar Explorer unavailable state, and Data Sources attribution', () => {
  it('enforces comparison guards for missing abundances and identical observations', async () => {
    const user = userEvent.setup();
    installFetchMock({
      '/observations': TEST_OBSERVATIONS,
      '/observations/CLASS_20191118': TEST_OBS_DETAIL_NOV,
      '/observations/CLASS_20200529': TEST_OBS_DETAIL_MAY,
    });

    renderWithProviders(<ComparisonPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Direct abundance comparison is unavailable because equivalent verified abundance records are not available for both observations/i,
        ),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Multiple source rows \(A: 1, B: 2\) — range shown/i),
    ).toBeInTheDocument();

    const selectB = screen.getByLabelText('Observation B');
    await user.selectOptions(selectB, 'CLASS_20191118');
    expect(screen.getByText('Select Two Distinct Observations')).toBeInTheDocument();
  });

  it('renders polished unavailable state when map availability is false', async () => {
    installFetchMock({
      '/map/availability': TEST_MAP_UNAVAILABLE,
    });

    renderWithProviders(<LunarExplorerPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Interactive Lunar Map Unavailable for Active Dataset'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('The active real dataset does not provide verified geospatial coordinates.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Planned Geolocated Mapping Workflow')).toBeInTheDocument();
  });

  it('renders ISRO acknowledgement, CC BY 4.0, and Mendeley vs ISSDC/PRADAN distinction', async () => {
    installFetchMock({
      '/datasets': TEST_DATASETS,
      '/dataset/summary': TEST_SUMMARY,
    });

    renderWithProviders(<DataSourcesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'CLASS_CHANDRAYAAN2' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/We acknowledge the use of data from the Chandrayaan-II/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mendeley Data is a public research-paper dataset/i).textContent,
    ).toMatch(/not the official ISRO mission archive/i);
    expect(screen.getByRole('link', { name: /ISSDC \/ PRADAN/i })).toBeInTheDocument();
  });
});
