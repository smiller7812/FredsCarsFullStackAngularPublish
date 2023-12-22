import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Vehicle } from './vehicle';
import { environment } from '../../environments/environment.development';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Category, VehicleType } from './vehicleType';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  // debug JSON var for HTML
  public json = JSON;
  public vehicles!: MatTableDataSource<Vehicle>
  public dataReady: boolean = false;
  
  columnsToDisplay: string[] = ['id', 'vehicleType', 'status', 'year', 'make', 'model', 'color', 'price'];

  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  public defaultSortColumn: string = "id";
  public defaultSortOrder: "asc" | "desc" = "asc";
  defaultFilterColumns: string = "make,model";
  filterValue?: string | null;
  // May not need: searchColumns
  searchColumns?: string | null;
  // May not need: searchValues
  searchValues?: string;
  search: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Category Search Checkbox client-model
  categoryAll: Category = {
    id: 0,
    name: 'All',
    selected: true,
    categories: []
  };
  allCategoriesSelected: boolean = true;

  constructor(private http: HttpClient) {
    // Instantiate the MatTableDataSource.
    this.vehicles = new MatTableDataSource<Vehicle>();
  }

  ngOnInit() {
    // moved get vehicles to load data
    //  so MatSort can call multiple times as user
    //  clicks a new sort column.
    this.loadData();

    // get vehcileTypes and transform into search categories
    //  for sidenav (leave in ngOnitInit since we only need to
    //  do this once)
    this.http.get<VehicleType[]>(environment.baseUrl + 'api/vehicleTypes').subscribe(result => {
      result.forEach(vt => {
        this.categoryAll.categories?.push(
          {
            id: vt.id,
            name: vt.name,
            selected: true
          }
        );
      })
    }, error => console.error(error));
  }

  loadData(filterValue?: string | null, search: boolean = false) {
    // get vehicles
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = 0;
    pageEvent.pageSize = 5;
    this.filterValue = filterValue;
    this.search = search;
    this.getVehicleData(pageEvent);
  }
  
  getVehicleData(event: PageEvent) {
    // get rid of third empty click state for MatSort
    if (this.sort && this.sort.direction == "") {
      this.sort.direction = "asc";
    }

    var url = environment.baseUrl + 'api/vehicles';
    var params = new HttpParams()
      .set("pageIndex", event.pageIndex.toString())
      .set("pageSize", event.pageSize.toString())
      .set("sortColumn", (this.sort)
        ? this.sort.active
        : this.defaultSortColumn)
      .set("sortOrder", (this.sort)
        ? this.sort.direction
        : this.defaultSortOrder);

    if (this.filterValue) {
      params = params
        .set("filterColumns", this.defaultFilterColumns)
        .set("filterValue", this.filterValue);
    }

    if (this.search) {
      // search on categories
      let categories: string = "";
      if (!(this.categoryAll.selected)
        && this.categoryAll.categories?.some(c => {
          return c.selected
        }))
      {
        this.categoryAll.categories?.forEach(c => {
          if (c.selected) {
            categories += `${c.name},`
          }
        })
        categories = categories.substr(0, categories.length - 1)

        params = params
          .set("searchValues", categories)
          .set("searchColumns", "vehicleType");
       }

      // search on other columns.
      // -- here...
    }

    this.http.get<any>(url, { params })
      .subscribe(result => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.search = result.searched;
        this.vehicles.data = result.data;
        this.dataReady = true;
      }, error => console.error(error));
  }

  /*** Category Search Checkbox methods ***/
  public someSearchCategoriesSelected(): boolean {
    return this.categoryAll.categories!.filter(cat =>
      cat.selected).length > 0 && !this.allCategoriesSelected;
  }

  setAllCategoriesSelected(checked: boolean) {
    this.allCategoriesSelected = checked;
    this.categoryAll.selected = checked;
    this.categoryAll.categories!.forEach(cat =>
      (cat.selected = checked));
  }

  updateAllCategoriesSelected() {
    var allSelected: boolean =
      this.categoryAll.categories!.every(cat =>
        cat.selected);

    this.allCategoriesSelected = allSelected;
    this.categoryAll.selected = allSelected;
  }
  /*** End Category Search Checkbox methods ***/
}
