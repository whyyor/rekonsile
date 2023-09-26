// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Link } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

import React, { useMemo } from 'react';

import { Record } from 'src/hooks/use-mocked-records';
import { MRT_ColumnDef, MaterialReactTable } from 'material-react-table';

interface Props {
  records: Array<Record>;
  onBrandSelect: Dispatch<SetStateAction<string>>;
}

export default function EcommerceDataview({ records, onBrandSelect }: Props) {
  const theme = useTheme();

  const columns = useMemo<MRT_ColumnDef<Record>[]>(
    () => [
      {
        header: 'Brand',
        accessorKey: 'brand',
        enableGrouping: true,
        GroupedCell: ({ cell, row }) => {
          return (
            <Button onClick={() => onBrandSelect(cell.getValue())}>
              {cell.getValue()} ({row.subRows?.length})
            </Button>
          );
        },
        size: 20,
      },
      {
        header: 'Revenue',
        accessorKey: 'revenue',
        enableGrouping: false,
        aggregationFn: 'sum',
        Cell: ({ cell, table }) => (
          <>
            <Box>
              {cell.getValue<number>()?.toLocaleString?.('en-US', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Box>
          </>
        ),
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {cell.getValue<number>()?.toLocaleString?.('en-US', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Box>
          </>
        ),
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
      {
        header: 'Price',
        accessorKey: 'price',
        enableGrouping: false,
        aggregationFn: 'mean',
        Cell: ({ cell, table }) => (
          <Box>
            {cell.getValue<number>()?.toLocaleString?.('en-US', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Box>
        ),
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: 'success.secondary', fontWeight: 'bold' }}>
              {cell.getValue<number>()?.toLocaleString?.('en-US', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Box>
          </>
        ),
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
      {
        header: 'Sales',
        accessorKey: 'sales',
        enableGrouping: false,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => {
          <Box>{cell.getValue<number>()?.toLocaleString()}</Box>;
        },
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
      //{
      //  header: 'Fees',
      //  accessorKey: 'Fees',
      //  enableGrouping: false,
      //  aggregationFn: 'sum',
      //  AggregatedCell: (cell) => {
      //    {
      //      cell;
      //    }
      //  },
      //},
      //{
      //  header: 'active_sellers',
      //  accessorKey: 'active_sellers',
      //  enableGrouping: false,
      //  aggregationFn: 'sum',
      //  AggregatedCell: (cell) => {
      //    {
      //      cell;
      //    }
      //  },
      //},
      {
        header: 'Ratings',
        accessorKey: 'ratings',
        enableGrouping: false,
        aggregationFn: 'mean',
        AggregatedCell: ({ cell, table }) => (
          <Box fontWeight="bold">
            {cell.getValue<number>()?.toLocaleString?.('en-US', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            <StarIcon color="warning" fontSize="small" sx={{ verticalAlign: 'text-bottom' }} />
          </Box>
        ),
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
      {
        header: 'Review Count',
        accessorKey: 'review_count',
        enableGrouping: false,
        aggregationFn: 'sum',
        AggregatedCell: (cell) => {
          {
            cell;
          }
        },
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
      {
        header: 'Product Name',
        accessorKey: 'product_details',
        enableGrouping: false,
        Cell: ({ cell, row }) => {
          return (
            <Link
              href={row?.original?.URL}
              target="_blank"
              sx={{
                maxWidth: '25em',
                display: 'block',
                overflowX:'auto',
              }}
            >
              {cell.getValue()}
            </Link>
          );
        },
      },
    ],

    []
  );

  return records.length ? (
    <MaterialReactTable
      columns={columns}
      data={records}
      positionExpandColumn="last"
      groupedColumnMode="reorder"
      enableGrouping
      manualGrouping={false}
      enableStickyHeader={true}
      enableStickyFooter={true}
      enableExpandAll={false}
      enableDensityToggle={false}
      enableColumnDragging={false}
      enableTopToolbar={false}
      enableColumnResizing={false}
      initialState={{
        density: 'compact',
        grouping: ['brand'], //an array of columns to group by by default (can be multiple)
        pagination: { pageIndex: 0, pageSize: 20 },
        sorting: [{ id: 'revenue', desc: true }], //sort by state by default
      }}
      defaultColumn={{
        size: 20,
        maxSize: 40,
        muiTableHeadCellProps: ({ column }) => ({
          sx: {
            fontSize: '9pt',
            minHeight: '100px',
          },
        }),
      }}
      muiToolbarAlertBannerChipProps={{ color: 'primary' }}
      muiTableContainerProps={{ sx: { maxHeight: '70vh' } }}
    />
  ) : (
    <div>Select a Product Type for more details...</div>
  );
}
