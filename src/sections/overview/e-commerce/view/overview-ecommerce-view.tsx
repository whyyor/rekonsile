// @mui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { Record, useMockedRecords } from 'src/hooks/use-mocked-records';
// _mock
import {
  _ecommerceNewProducts,
  _ecommerceSalesOverview,
  _ecommerceBestSalesman,
  _ecommerceLatestProducts,
} from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { MotivationIllustration } from 'src/assets/illustrations';
//
import EcommerceDataview from '../ecommerce-dataview';
import RevenueChart from '../ecommerce-revenuechart';
import EcommerceWelcome from '../ecommerce-welcome';
import EcommerceNewProducts from '../ecommerce-new-products';
import EcommerceYearlySales from '../ecommerce-yearly-sales';
import EcommerceBestSalesman from '../ecommerce-best-salesman';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceLatestProducts from '../ecommerce-latest-products';
import EcommerceCurrentBalance from '../ecommerce-current-balance';

import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { CardActions, CardHeader } from '@mui/material';
import { useState } from 'react';
import { sum, mean, max } from 'lodash-es';
import Chart from 'src/components/chart/chart';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// ----------------------------------------------------------------------
function getCategoryBrandMapping(records: Array<Record>) {
  return records.reduce((mapping, product) => {
    const product_type = product['type'];
    const product_brand = product['brand'];
    if (!mapping.has(product_type)) {
      mapping.set(product_type, new Set());
    }
    mapping.get(product_type).add(product_brand);
    return mapping;
  }, new Map());
}

function getBrandOfCategory(
  categoryBrandMapping: Map<String, Set<String>>,
  categoryName: string
): Array<String> {
  return Array.from(categoryBrandMapping.get(categoryName));
}

function aggregateRecordsByBrand(records: Array<Record>) {
  const recordsGroupBy = records.reduce((brandGroup, record, idx) => {
    const brand = record.brand;
    if (!brandGroup.has(brand)) {
      brandGroup.set(brand, []);
    }
    brandGroup.get(brand).push(record);
    return brandGroup;
  }, new Map());
  const agg = Array.from(recordsGroupBy).map(([brand, records]) => {
    return {
      brand,
      revenue: sum(records.map((r) => r.revenue)),
      sales: sum(records.map((r) => r.sales)),
      product_count: records.length,
      avg_selling_price: mean(records.map((r) => r.price)),
      review_count: sum(records.map((r) => r.review_count)),
      avg_rating: mean(records.map((r) => r.ratings)),
    };
  });
  return agg;
}

function getAggTable(brand, agg) {
  if (!brand || !agg) {
    return <></>;
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '60em' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Metric</TableCell>
            <TableCell align="right">{brand}</TableCell>
            <TableCell align="right">mean</TableCell>
            <TableCell align="right">max</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">
              Revenue
            </TableCell>
            <TableCell align="right">
              {agg.filter((r) => r.brand === brand)[0]?.revenue?.toLocaleString() || 'N/A'}
            </TableCell>
            <TableCell align="right">{mean(agg.map((r) => r.revenue)).toLocaleString()}</TableCell>
            <TableCell align="right">{max(agg.map((r) => r.revenue)).toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Sales
            </TableCell>
            <TableCell align="right">
              {agg.filter((r) => r.brand === brand)[0]?.sales?.toLocaleString() || 'N/A'}
            </TableCell>
            <TableCell align="right">{mean(agg.map((r) => r.sales)).toLocaleString()}</TableCell>
            <TableCell align="right">{max(agg.map((r) => r.sales)).toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Ratings
            </TableCell>
            <TableCell align="right">
              {agg.filter((r) => r.brand === brand)[0]?.avg_rating?.toLocaleString() || 'N/A'}
            </TableCell>
            <TableCell align="right">
              {mean(
                agg.filter((r) => !isNaN(r.avg_rating)).map((r) => r.avg_rating)
              ).toLocaleString()}
            </TableCell>
            <TableCell align="right">
              {max(agg.map((r) => r.avg_rating)).toLocaleString()}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">
              Review Count
            </TableCell>
            <TableCell align="right">
              {agg.filter((r) => r.brand === brand)[0]?.review_count?.toLocaleString() || 'N/A'}
            </TableCell>
            <TableCell align="right">
              {mean( agg.map((r) => r.review_count)).toLocaleString()}
            </TableCell>
            <TableCell align="right">
              {max(agg.map((r) => r.review_count)).toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Adding comparison for selected brands

type AggRecord = {  
  brand: string;
  revenue?: number;
  sales?: number;
  avg_rating?: number;
  review_count?: number;
};

interface CompareBrandsProps {
  agg: AggRecord[];
  brand: string;
}

function CompareBrands(props: CompareBrandsProps) {
  const { agg, brand: selectedBrand } = props;

  // Create a mapping of brands to their records for efficient lookup
  const brandMapping: { [key: string]: AggRecord } = {};
  agg.forEach(record => {
    brandMapping[record.brand] = record;
  });

  const uniqueBrands = [...new Set(agg.map((record) => record.brand))].filter((brand) => brand !== selectedBrand);
  const [compareWithBrands, setCompareWithBrands] = useState<string[]>([]);

  const handleCompareWithBrandsChange = (event) => {
    setCompareWithBrands(event.target.value);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={`Compare ${selectedBrand} With Other Brands`} />
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          Select the brands you want to compare with {selectedBrand}
        </Typography>
        <FormControl sx={{ minWidth: '40%', mx: 2 }}>
          <InputLabel id="compare-with-brands-label">Compare With</InputLabel>
          <Select
            labelId="compare-with-brands-label"
            id="compare-with-brands"
            multiple
            value={compareWithBrands}
            onChange={handleCompareWithBrandsChange}
          >
            {uniqueBrands.map((brand) => (
              <MenuItem key={brand} value={brand}>
                {brand}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
      <TableContainer component={Paper} sx={{ maxWidth: '60em' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell align="right">{selectedBrand}</TableCell>
              {compareWithBrands.map((brand) => (
                <TableCell align="right" key={brand}>{brand}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { display: 'Revenue', key: 'revenue' },
              { display: 'Sales', key: 'sales' },
              { display: 'Avg Rating', key: 'avg_rating' }, // Corrected here
              { display: 'Review Count', key: 'review_count' }
            ].map((metricObj) => {
              const { display, key } = metricObj;

              return (
                <TableRow key={display}>
                  <TableCell component="th" scope="row">{display}</TableCell>
                  <TableCell align="right">
                    {brandMapping[selectedBrand]?.[key]?.toLocaleString()}
                  </TableCell>
                  {compareWithBrands.map((brand) => (
                    <TableCell align="right" key={brand}>
                      {brandMapping[brand]?.[key]?.toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}





export default function OverviewEcommerceView() {
  const { user } = useMockedUser();
  const { records } = useMockedRecords();

  const [productType, setProductType] = useState('');
  const [brand, setBrand] = useState('');

  const categoryBrandMapping = getCategoryBrandMapping(records);

  const theme = useTheme();

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={`Welcome \n ${user?.displayName}!`} />
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Please select a product type from the dropdown below to analyze further
              </Typography>
            </CardContent>
            <CardActions>
              <FormControl sx={{ minWidth: '40%', mx: 2 }}>
                <InputLabel id="product-category-select-label">Product Type</InputLabel>
                <Select
                  labelId="product-category-select-label"
                  id="product-category-select"
                  label="Select Product Type"
                  value={productType}
                  onChange={(event: SelectChangeEvent) => {
                    setProductType(event.target.value as string);
                  }}
                >
                  {Array.from(categoryBrandMapping.keys()).map((categoryName) => (
                    <MenuItem key={categoryName} value={categoryName}>
                      {categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
            </CardActions>
          </Card>
        </Grid>

        <Grid xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Brand-Revenue Shares" />
            <CardContent>
              <RevenueChart
                chartData={aggregateRecordsByBrand(
                  records.filter((r) => (productType ? r.type === productType : true))
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardHeader title={'Product Type Summary ' + (productType ? `(${productType})` : '')} />
            <CardContent>
              <EcommerceDataview
                records={records.filter((r) => r.type === productType)}
                onBrandSelect={setBrand}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sx={!productType ? { display: 'none' } : {}}>
          <Typography variant="h2">Brand performance: {brand ?? '-'}</Typography>
          <Typography variant="p" color="text.secondary" sx={brand ? { display: 'none' } : {}}>
            Select a brand from above for further analysis...
          </Typography>
        </Grid>

        <Grid xs={12} md={8} sx={!brand ? { display: 'none' } : {}}>
          <Card>
            <CardContent>
              {getAggTable(
                brand,
                aggregateRecordsByBrand(records.filter((r) => r.type == productType))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceWidgetSummary
            title="Product Sold"
            percent={2.6}
            total={765}
            chart={{
              series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
            }}
          />
        </Grid>

        <Grid xs={12} md={4} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceWidgetSummary
            title="Total Balance"
            percent={-0.1}
            total={18765}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
            }}
          />
        </Grid>

        <Grid xs={12} md={4} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceWidgetSummary
            title="Sales Profit"
            percent={0.6}
            total={4876}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [40, 70, 75, 70, 50, 28, 7, 64, 38, 27],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceSaleByGender
            title="Sale By Gender"
            total={2324}
            chart={{
              series: [
                { label: 'Mens', value: 44 },
                { label: 'Womens', value: 75 },
              ],
            }}
          />
        </Grid>

      <Grid xs={12} md={8} sx={!brand ? { display: 'none' } : {}}>
        <Card>
          <CardContent>
            <CompareBrands 
              agg={aggregateRecordsByBrand(records.filter((r) => r.type == productType))}
              brand={brand}
            />
          </CardContent>
        </Card>
      </Grid>


        <Grid xs={12} md={6} lg={8} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceYearlySales
            title="Yearly Sales"
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
                  year: '2021',
                  data: [
                    {
                      name: 'Total Income',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2022',
                  data: [
                    {
                      name: 'Total Income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceSalesOverview title="Sales Overview" data={_ecommerceSalesOverview} />
        </Grid>

        <Grid xs={12} md={6} lg={4} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceCurrentBalance
            title="Current Balance"
            currentBalance={187650}
            sentAmount={25500}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceBestSalesman
            title="Best Salesman"
            tableData={_ecommerceBestSalesman}
            tableLabels={[
              { id: 'name', label: 'Seller' },
              { id: 'category', label: 'Product' },
              { id: 'country', label: 'Country', align: 'center' },
              { id: 'totalAmount', label: 'Total', align: 'right' },
              { id: 'rank', label: 'Rank', align: 'right' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4} sx={!brand ? { display: 'none' } : {}}>
          <EcommerceLatestProducts title="Latest Products" list={_ecommerceLatestProducts} />
        </Grid>
      </Grid>
    </Container>
  );
}
