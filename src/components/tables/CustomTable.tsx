import { Table, useMantineTheme } from "@mantine/core";
import { usePagination, useTable } from "react-table";

type CustomTableProps = {
  data: any[];
  columns: any;
  form?: JSX.Element;
  initialState?: any;
  tableHooks?: any;
  controlledPageCount?: number;
  pagination?: boolean;
};

const CustomTable = (props: CustomTableProps) => {
  const {
    data,
    columns,
    form,
    initialState,
    tableHooks,
    controlledPageCount,
    pagination,
  } = props;
  const theme = useMantineTheme();

  // console.log(tableHooks);
  // if (initialState && pagination) {
  //   initialState.pageIndex = 0;
  // }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // page,
    // canPreviousPage,
    // canNextPage,
    // pageOptions,
    // pageCount,
    // gotoPage,
    // nextPage,
    // previousPage,
    // setPageSize,
    // state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState,
      // manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount ? controlledPageCount : 100,
    },
    tableHooks
    // usePagination
  );
  return (
    <>
      <Table {...getTableProps()} width={"100%"} striped>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps({
                    style: {
                      maxWidth: column.maxWidth,
                      width: column.width,
                      minWidth: column.minWidth,
                      textAlign: "center",
                    },
                  })}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {form ? <tbody>{form ? form : null}</tbody> : null}
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                style={{
                  backgroundColor: theme.colors.teal[1],
                  fontWeight: "bold",
                }}
              >
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      {/* {pagination && (
        <div className="pagination">
          
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </button>{" "}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {"<"}
          </button>{" "}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {">"}
          </button>{" "}
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {">>"}
          </button>{" "}
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <span>
            | Go to page:{" "}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: "100px" }}
            />
          </span>{" "}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      )} */}
    </>
  );
};

export default CustomTable;
