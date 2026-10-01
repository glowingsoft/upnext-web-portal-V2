import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { useDebouncedInput } from 'src/hooks/use-debounced-input';
import { useGetPublicPackagesQuery, useGetPublicServicesQuery } from 'src/store/Reducer/services-api';
import { getItemId, normalizePackage, normalizeService } from 'src/sections/active-sections/services-view/customer-services-view';
import ServiceCard from 'src/sections/active-sections/services-view/components/service-card-main';
import PackageCard from 'src/sections/active-sections/services-view/components/package-card';

import CardSkeleton from './CardSkeleton';
import SearchBox from './SearchBox';
import SurfaceCard from './SurfaceCard';
import { brand } from './theme';

const LIMIT = 12;

function usePaginatedList(useQuery, keyword) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const { data, isFetching } = useQuery({ page, limit: LIMIT, keyword: keyword || undefined });

  useEffect(() => {
    if (!data?.data) return;
    setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const total = data?.meta?.total ?? data?.meta?.totalRecords ?? items.length;
  const hasMore = items.length < total;

  return {
    items,
    total,
    hasMore,
    isInitialLoading: isFetching && page === 1,
    isLoadingMore: isFetching && page > 1,
    loadMore: () => setPage((prev) => prev + 1),
  };
}

const TABS = [
  { value: 'services', label: 'Services', icon: 'solar:bill-list-bold-duotone', emptyLabel: 'No services found' },
  { value: 'packages', label: 'Packages', icon: 'solar:box-minimalistic-bold', emptyLabel: 'No packages found' },
];

export default function ServicesPackagesSection() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user);
  const userType = user?.accountState?.userType;
  const isCustomer = userType === 'customer' || userType === 'user';
  const [activeTab, setActiveTab] = useState('services');
  const { displayValue: search, debouncedValue: keyword, handleChange: handleSearchChange, reset: resetSearch } = useDebouncedInput('', undefined, 500);

  const services = usePaginatedList(useGetPublicServicesQuery, keyword);
  const packages = usePaginatedList(useGetPublicPackagesQuery, keyword);

  const active = activeTab === 'services' ? services : packages;
  const activeTabMeta = TABS.find((tab) => tab.value === activeTab);

  const handleView = (item) => {
    if (!isLoggedIn) {
      navigate(paths.auth.jwt.signIn);
      return;
    }

    const itemId = getItemId(item);
    if (!itemId) return;

    if (!isCustomer) {
      if (item.providerId) navigate(paths.stylist.details(item.providerId));
      return;
    }

    if (activeTab === 'packages') {
      navigate(paths.dashboard.packageDetails(itemId));
      return;
    }

    navigate(paths.dashboard.serviceDetails(itemId), { state: { service: item } });
  };

  return (
    <Box id="services" sx={{ mt: 4, mb: 3, px: { xs: 2, md: 3 }, scrollMarginTop: '92px' }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: brand.green[600] }}>
            Services & Packages
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                minHeight: 40,
                borderRadius: 99,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.825rem',
                px: 2,
                mr: 1,
                border: '1px solid',
                borderColor: 'divider',
              },
              '& .Mui-selected': {
                color: `${brand.green[600]} !important`,
                bgcolor: alpha(brand.green[400], 0.1),
                borderColor: brand.green[400],
              },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={<Iconify icon={tab.icon} width={16} />}
                iconPosition="start"
                label={`${tab.label} (${(tab.value === 'services' ? services : packages).total})`}
              />
            ))}
          </Tabs>
        </Box>

        <SearchBox
          icon="mingcute:search-line"
          placeholder="Search services & packages…"
          value={search}
          onChange={handleSearchChange}
          onClear={resetSearch}
          sx={{ width: '100%', minWidth: 0 }}
        />
      </Stack>

      {active.isInitialLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : active.items.length > 0 ? (
        <Grid container spacing={2}>
          {active.items.map((rawItem) => {
            const item = activeTab === 'services' ? normalizeService(rawItem) : normalizePackage(rawItem);
            return (
              <Grid key={getItemId(item)} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                {activeTab === 'services' ? (
                  <ServiceCard svc={item} onView={() => handleView(item)} hideDistance />
                ) : (
                  <PackageCard pkg={item} onView={() => handleView(item)} hideDistance />
                )}
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <SurfaceCard
          sx={{
            py: 7,
            px: 3,
            textAlign: 'center',
            background: `linear-gradient(145deg, #F3EADC 0%, #FDFBF7 100%)`,
            border: `1px dashed ${alpha(brand.green[400], 0.35)}`,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: alpha(brand.green[400], 0.1),
              border: `1.5px solid ${alpha(brand.green[400], 0.25)}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
              mx: 'auto',
            }}
          >
            <Iconify icon={activeTabMeta.icon} width={28} sx={{ color: brand.green[600] }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {activeTabMeta.emptyLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.8 }}>
            {keyword ? 'Try a different search term.' : 'Check back soon — new listings are added regularly.'}
          </Typography>
        </SurfaceCard>
      )}

      {!active.isInitialLoading && active.hasMore && (
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={active.loadMore}
            disabled={active.isLoadingMore}
            endIcon={<Iconify icon={active.isLoadingMore ? 'eos-icons:loading' : 'mingcute:down-line'} width={16} />}
            sx={{
              borderRadius: 99,
              px: 3,
              fontWeight: 700,
              color: brand.green[600],
              borderColor: alpha(brand.green[400], 0.4),
              '&:hover': { borderColor: brand.green[400], bgcolor: alpha(brand.green[400], 0.06) },
            }}
          >
            {active.isLoadingMore ? 'Loading…' : 'Load More'}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
