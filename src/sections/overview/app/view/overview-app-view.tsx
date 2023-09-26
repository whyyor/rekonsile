// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
import trendwiseRecords from 'src/hooks/trendwiseRecords.json';
// _mock
import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//

import AppWidget from '../app-widget';
import AppWelcome from '../app-welcome';
import AppFeatured from '../app-featured';
import AppNewInvoice from '../app-new-invoice';
import AppTopAuthors from '../app-top-authors';
import AppTopRelated from '../app-top-related';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppTopInstalledCountries from '../app-top-installed-countries';

import {
  TrendRecord,
  getProductCategories,
  useMockedTrends,
} from 'src/hooks/use-mocked-trends-data';
import Card from '@mui/material/Card';
import { Box, CardContent, CardHeader, FormControl, InputLabel, Typography } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';

import Chart, { useChart } from 'src/components/chart';
import { sum } from 'lodash';
import { maxHeight } from '@mui/system';

// ----------------------------------------------------------------------





function trendsToChartData(trends: Array<TrendRecord>, fn: Function, fromDate: string, toDate: string) {
  const filteredTrends = trends.filter(record => new Date(record.date) >= new Date(fromDate) && new Date(record.date) <= new Date(toDate));
  const d = Array.from(
    filteredTrends
      .reduce((curr, record) => {
        if (!curr.has(record.brand)) {
          curr.set(record.brand, {
            data: [],
          });
        }
        const value = fn(record);
        if (!value) {
          return curr;
        }
        curr.get(record.brand).data.push([new Date(record.date).getTime(), value]);
        return curr;
      }, new Map())
      .entries()
  ).map(([brand, data]) => {
    return {
      name: brand,
      type: 'area',
      data: data.data,
    };
  });
  return d;
}


// creating new function for 2 lined graphs
function trendsToChartData1(trends: Array<TrendRecord>, fromDate: string, toDate: string) {
  const filteredTrends = trends.filter(record => new Date(record.date) >= new Date(fromDate) && new Date(record.date) <= new Date(toDate));
  const d = Array.from(
    filteredTrends // Use filteredTrends instead of trends
      .reduce((curr, record) => {
        if (!curr.has(record.brand)) {
          curr.set(record.brand, {
            salesData: [],
            pricesData: []
          });
        }
        const salesValue = record.avgSales;
        const priceValue = record.avgPrice / 8;

        if (salesValue) {
          curr.get(record.brand).salesData.push([new Date(record.date).getTime(), salesValue]);
        }

        if (priceValue) {
          curr.get(record.brand).pricesData.push([new Date(record.date).getTime(), priceValue]);
        }

        return curr;
      }, new Map())
      .entries()
  ).flatMap(([brand, data]) => {
    return [
      {
        name: `${brand} Sales`,
        type: 'area',
        data: data.salesData,
      },
      {
        name: `${brand} Prices`,
        type: 'area',
        data: data.pricesData,
      }
    ];
  });
  return d;
}




function getMarketShares(productCategory: string) {
  const marketSharesMap = useMockedTrends(productCategory).reduce((curr, record) => {
    if (!curr.has(record.brand) && record.avgSales) {
      curr.set(record.brand, record.avgSales);
    }
    return curr;
  }, new Map());

  return {
    series: Array.from(marketSharesMap.values()),
    labels: Array.from(marketSharesMap.keys()),
  };
}

export default function OverviewAppView() {
  const { user } = useMockedUser();

  const [productCategory, setproductCategory] = useState('');

  const unique_dates = Array.from(new Set(trendwiseRecords.map(record => record.date))).sort();
//const [productCategory, setProductCategory] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(unique_dates[0]);
  const [toDate, setToDate] = useState<string>(unique_dates[unique_dates.length - 1]);

  const theme = useTheme();

  const settings = useSettingsContext();

  const analyzePerformance = (productCategory: string) => {
    const trendData = useMockedTrends(productCategory);
    if (!trendData.length) {
      return {};
    }

    const myBrand = trendData[0].brand;

    // Assuming you have the fromDate and toDate states available in the same context

// 1. Filter trendData based on the selected date range
const filteredTrendData = trendData.filter(record => record.date >= fromDate && record.date <= toDate);

// 2. Use the filtered data for calculations
return {
    myBrand,
    revenueThisWeek: filteredTrendData
        .filter((record) => record.brand === myBrand)
        .map((r) => r.avgSales * r.avgPrice),
    PricesThisWeek: filteredTrendData
        .filter((record) => record.brand === myBrand)
        .map((r) => r.avgPrice),
    unitsSoldThisWeek: filteredTrendData
        .filter((record) => record.brand === myBrand)
        .map((r) => r.avgSales),
};

  };
  const widgetData = analyzePerformance(productCategory);


return (
  <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    <Grid container spacing={3}>
      <Grid xs={12}>
        <AppWelcome
          title={`Welcome back 👋 \n ${user?.displayName}`}
          description={`Select Your Product Category (${
            analyzePerformance(productCategory)?.myBrand ?? ''
          })`}
          img={<SeoIllustration />}
          action={
            <Stack spacing={2} direction="row">
              <FormControl fullWidth>
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={productCategory}
                  label="ProductType"
                  onChange={(event) => {
                    setproductCategory(event.target.value as string);
                  }}
                >
                  {getProductCategories().map((prod, itr) => (
                    <MenuItem value={prod} key={itr}>
                      {prod}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>From Date</InputLabel>
                <Select
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.target.value as string);
                  }}
                >
                  {unique_dates.map((date, itr) => (
                    <MenuItem value={date} key={itr}>
                      {date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>To Date</InputLabel>
                <Select
                  value={toDate}
                  onChange={(event) => {
                    setToDate(event.target.value as string);
                  }}
                >
                  {unique_dates.map((date, itr) => (
                    <MenuItem value={date} key={itr}>
                      {date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          }
        />
      </Grid>
    
          
    <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="My Market Share"
            {...{
            
            chart: {
              series: widgetData.PricesThisWeek,
            },
            percent:
                (widgetData.PricesThisWeek?.at(0) ??
                  0 / widgetData?.PricesThisWeek?.at(-1) ??
                  1) - 1,
            total: sum(widgetData.PricesThisWeek ?? [0]),
          }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="My Units Sales"
            {...{
              chart: {
                series: widgetData.unitsSoldThisWeek,
              },
              percent:
                (widgetData.unitsSoldThisWeek?.at(0) ??
                  0 / widgetData?.unitsSoldThisWeek?.at(-1) ??
                  1) - 1,
              total: sum(widgetData.unitsSoldThisWeek ?? [0]),
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="My Market Revenue"
            {...{
              chart: {
                series: widgetData.revenueThisWeek,
                colors: [theme.palette.warning.light, theme.palette.warning.main],
              },
              percent:
                (widgetData.revenueThisWeek?.at(0) ??
                  0 / widgetData?.revenueThisWeek?.at(-1) ??
                  1) - 1,
              total: sum(widgetData.revenueThisWeek ?? [0]),
            }}
          />
        </Grid>


        <Grid xs={12} md={7} sx={{ minHeight: "100%"}}>
          <Card>
            <CardHeader title="Revenue Trends" />
            <CardContent>
              <Box>
                <Chart
                  type="line"
                  series={trendsToChartData(
                    useMockedTrends(productCategory),
                    (record: TrendRecord) => {
                      return record.avgPrice * record.avgSales;
                    },
                    fromDate,
                    toDate
                  )}
                  options={useChart({
                    xaxis: {
                      type: 'datetime',
                    },
                    tooltip: {
                      shared: true,
                      intersect: false,
                      y: {
                        formatter: (value: number) => {
                          if (typeof value !== 'undefined') {
                            return `${value.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'INR',
                            })}`;
                          }
                          return value;
                        },
                      },
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.35,
                        opacityTo: 0.01,
                        stops: [20, 100, 100, 100],
                      },
                    },
                  })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>


        <Grid xs={12} md={5}>
          <Card>
            <CardHeader title="Market Shares (Latest)" />
            <CardContent>
              <Box sx={{ p: 3, pb: 1 }}>
                <Chart
                  type="donut"
                  series={getMarketShares(productCategory).series}
                  options={useChart({
                    labels: getMarketShares(productCategory).labels,
                    tooltip: {
                      y: {
                        formatter: (value: number) => {
                          if (typeof value !== 'undefined') {
                            return `${value} units`;
                          }
                          return value;
                        },
                      },
                    },
                  })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title="Price Trends" />
            <CardContent>
              <Box sx={{ p: 3, pb: 1 }}>
                <Chart
                  type="line"
                  series={trendsToChartData(
                    useMockedTrends(productCategory),
                    (record: TrendRecord) => {
                      return record.avgPrice;
                    },
                    fromDate,
                    toDate
                  )}
                  options={useChart({
                    plotOptions: {
                      bar: {
                        columnWidth: '16%',
                      },
                    },
                    xaxis: {
                      type: 'datetime',
                    },
                    tooltip: {
                      shared: true,
                      intersect: false,
                      y: {
                        formatter: (value: number) => {
                          if (typeof value !== 'undefined') {
                            return `${value.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'INR',
                            })}`;
                          }
                          return value;
                        },
                      },
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.35,
                        opacityTo: 0.01,
                        stops: [20, 100, 100, 100],
                      },
                    },
                  })}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title="Sales Trends" />
            <CardContent>
              <Box sx={{ p: 3, pb: 1 }}>
                <Chart
                  type="line"
                  series={trendsToChartData(
                    useMockedTrends(productCategory),
                    (record: TrendRecord) => {
                      return record.avgSales;
                    },
                    fromDate,
                    toDate
                  )}
                  options={useChart({
                    plotOptions: {
                      bar: {
                        columnWidth: '16%',
                      },
                    },
                    xaxis: {
                      type: 'datetime',
                    },
                    tooltip: {
                      shared: true,
                      intersect: false,
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.35,
                        opacityTo: 0.01,
                        stops: [20, 100, 100, 100],
                      },
                    },
                  })}
                />
              </Box>
            </CardContent>
          </Card>
          </Grid>
          <Grid container spacing={1}>
            {(() => {
              const trendsData = useMockedTrends(productCategory);
              const uniqueBrands = Array.from(new Set(trendsData.map(record => record.brand)));

              return uniqueBrands.map((brand, index) => {
                const brandSpecificData = trendsData.filter(record => record.brand === brand);
                return (
                  <Grid xs={12} md={12}>
           <Card>
            <CardHeader title={`Sales Trends - ${brand}`} />
            <CardContent>
              <Box sx={{ p: 0, pb: 0 }}>
                <Chart
                  type="line"
                  series={trendsToChartData1(brandSpecificData, fromDate, toDate).map((series, sIndex) => ({
                    ...series,
                    yAxisIndex: sIndex
                  }))}
                  options={useChart({
                    plotOptions: {
                      bar: {
                        columnWidth: '16%',
                      },
                    },
                    xaxis: {
                      type: 'datetime',
                    },
                    yaxis: [
                      {
                        title: {
                          text: 'Sales',
                        },
                      },
                      {
                        opposite: true,
                        title: {
                          text: 'Prices',
                        },
                      }
                    ],
                    tooltip: {
                      shared: true,
                      intersect: false,
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.35,
                        opacityTo: 0.01,
                        stops: [20, 100, 100, 100],
                      },
                    },
                  })}
                />
              </Box>
            </CardContent>
           </Card>
          </Grid>
            );
                });
                })()}
        </Grid>
        


        { /*
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Current Download"
            chart={{
              series: [
                { label: 'Mac', value: 12244 },
                { label: 'Window', value: 53345 },
                { label: 'iOS', value: 44313 },
                { label: 'Android', value: 78343 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Area Installed"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  year: '2019',
                  data: [
                    {
                      name: 'Asia',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'America',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Asia',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'America',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="New Invoice"
            tableData={_appInvoices}
            tableLabels={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Category' },
              { id: 'price', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopRelated title="Top Related Applications" list={_appRelated} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopInstalledCountries title="Top Installed Countries" list={_appInstalled} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopAuthors title="Top Authors" list={_appAuthors} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <Stack spacing={3}>
            <AppWidget
              title="Conversion"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 48,
              }}
            />

            <AppWidget
              title="Applications"
              total={55566}
              icon="fluent:mail-24-filled"
              color="info"
              chart={{
                series: 75,
              }}
            />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured list={_appFeatured} />
        </Grid>
        */}
      </Grid>
      
    </Container>
  );
  
}
