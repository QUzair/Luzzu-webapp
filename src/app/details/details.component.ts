import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { VDataService } from '../v-data.service'
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../material.module';
import { FormsModule, Validators } from '@angular/forms'
import 'hammerjs';
import { Chart } from 'chart.js';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MetricDialogComponent } from '../metric-dialog/metric-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MetricProfileComponent } from '../metric-profile/metric-profile.component'
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { saveAs } from 'file-saver';
import { TEMPLATE_DRIVEN_DIRECTIVES } from '@angular/forms/src/directives';


interface Coordinate {
  x: number,
  y: number
}

interface TableMetrics {
  Dataset_PLD: string,
  Metrics: any[]
}

interface TimeGraphData {
  label: string,
  borderColor: string,
  fill: false,
  data: Coordinate[]
}

interface TableEntry {
  'Metric-Label': string,
  'Value': number,
  'LODAvg': number,
  'Date-Computed': string,
  'Type': string
  'Percentage': number
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})


export class DetailsComponent implements OnInit {

  DatasetURL: string
  Dimen: string[] = ['Categories', 'Dimensions', 'Metrics'];

  Table: TableEntry[] = [{ 'Metric-Label': "Ontology hijacking metric", Value: 1.6513225193628522, LODAvg: 93.64, 'Date-Computed': "2018-08-09", 'Type': "Double", Percentage: 0 }]
  sortedData: TableEntry[] = []


  //For Controls for Filtering options
  CategoriesF = new FormControl('', [
    Validators.required
  ]);
  DimensionsF = new FormControl('', [
    Validators.required
  ]);

  double_minForm = new FormControl('', [
    Validators.required
  ]);
  double_maxForm = new FormControl('', [
    Validators.required
  ]);
  int_minForm = new FormControl('', [
    Validators.required
  ]);
  int_maxForm = new FormControl('', [
    Validators.required
  ]);


  ShowBooleansVal = false
  ShowThresholds = false
  VisChoice = "Radar"

  //Counter for Charts
  RadarCounter = 0
  BarCounter = 0

  Count_Value: number = 0
  DoubleMetrics = []
  IntMetrics = []
  BooleanMetrics = []

  doubleLOD = []
  intLOD = []
  boolLOD = []
  NotFoundLODData = []

  CountMetric = 'Unknown'
  Syntax_boolean = false
  showProfilePage = false
  CatList = []
  DimList = []
  Filteredmetrics = []
  filterMetrics = false
  posts$: Object
  label = "No profile selected";
  quality_metrics = []
  show = false
  showMetrics = false

  //Hold Chart Elements
  chart = []
  radarChart = []
  barChart = []
  TimeChart = []

  RankedUsers = []
  lodDataService = []
  labelMetrics = []
  lodData = []
  rlabels1 = []
  rdata1 = []
  AssessDates = []
  msg: any
  VisChoices = ['Table', 'Radar', 'Bar', 'Line']
  timeFormat = 'YYYY-MM-DD'
  DatasetTable: TableMetrics[] = []

  constructor(private data: DataService, private vdata: VDataService, public dialog: MatDialog, private route: ActivatedRoute) {

    //Parse the URL and decode ID parameter, contains dataset label name
    this.route.params.subscribe((params) => {
      console.log(`Dataset URL: ${decodeURIComponent(params.id)}`)
      this.label = decodeURIComponent(params.id)
      this.data.changeLabel(this.label)
    })
  }

  ngOnInit() {

    //Observe What current Metric we are on 
    this.data.CurrentMetric.subscribe((res) => {
      console.log(res)
      this.msg = res
    })

    //Observe what are our most recent Ranked Users
    this.data.currentRankedUsers.subscribe((res) => {
      console.log(res)
      this.RankedUsers = res
      console.log(typeof (this.RankedUsers))
      let r = this.RankedUsers.findIndex(res => res['Dataset-PLD'] == this.label)
      console.log(r)

      this.getDatasetMetrics(r)
    })

    //Receive Assessment Dates for Dataset
    this.data.getAssessmentdates(this.label).subscribe((res) => {
      this.AssessDates = res['Assessment-Dates']
      console.log(this.AssessDates)

      //Load most recent Metrics
      this.loadMetrics()
    })

    //Get filtered Facets to create a Category and Dimensions List to be used in Filter Section
    this.data.getFacets()
      .subscribe(
        data => {
          this.posts$ = (data.Categories)
          console.log(this.posts$)

          //Creating List of Categories and Dimensions
          for (let c in this.posts$) {
            this.CatList.push(this.posts$[c].Label)
            for (let d in this.posts$[c].Dimensions) {
              this.DimList.push(this.posts$[c].Dimensions[d].Label)
              for (let m in this.posts$[c].Dimensions[d].Metrics) {
              }
            }
          }
          console.log(`category list ${this.CatList}`)
          console.log(`dimensions list ${this.DimList}`)
        })

  }

  //Loads most recent metrics and Sections them by types Double, Integer and Boolean 
  loadMetrics() {
    this.vdata.vsQuality(this.label).subscribe(
      (data) => {
        let threshVal = 0
        console.log(data)
        this.quality_metrics = data.Metrics

        //Checking for Syntax Error
        //Adding Threshold Weights
        //Converting value of double to percentage 
        for (let i in this.quality_metrics) {
          if (this.quality_metrics[i]['Metric-Label'] === 'Count Metric') this.Count_Value = this.quality_metrics[i].Observations[0]['Value']
          else if (this.quality_metrics[i]['Metric-Label'] === 'Syntax Error')
            if (this.quality_metrics[i].Observations[0]['Value'] == 1) this.Syntax_boolean = true

          console.log(this.quality_metrics[i].Observations[0]['Value-Type'])
          if (this.quality_metrics[i].Observations[0]['Value-Type'] === "Double")
            this.quality_metrics[i].Observations[0]['Value'] = this.quality_metrics[i].Observations[0]['Value'] * 100

          if (this.quality_metrics[i].Observations[0]['Value-Type'] === 'Double') threshVal = 100
          else if (this.quality_metrics[i].Observations[0]['Value-Type'] === 'Integer') threshVal = 1000
          else if (this.quality_metrics[i].Observations[0]['Value-Type'] === 'Boolean') threshVal = 0
          else threshVal = 0

          Object.defineProperty(this.quality_metrics[i], 'weight', {
            value: threshVal,
            writable: true,
            configurable: true
          })
        }

        console.log(this.quality_metrics)

        //Creating arrays for the different type of metrics

        this.DoubleMetrics = []
        this.IntMetrics = []
        this.BooleanMetrics = []

        this.quality_metrics.map((res) => {

          let MetricType = res.Observations[0]['Value-Type']
          if (MetricType === 'Double') {
            this.DoubleMetrics.push(res)
          }
          else if (MetricType === 'Integer') {
            this.IntMetrics.push(res)
          }
          else if (MetricType === 'Boolean') {
            this.BooleanMetrics.push(res)
          }
        })

        console.log('Sectioning')
        console.log(this.DoubleMetrics)
        console.log(this.IntMetrics)
        console.log(this.BooleanMetrics)

        let doubleLabels = this.DoubleMetrics.map(res => res['Metric-Label'])
        let doubleData = this.DoubleMetrics.map(res => res.Observations[0]['Value'])

        console.log('Double Labels and Data')
        console.log(doubleLabels)
        console.log(doubleData)

        //Sorting Metrics in Ascending Order of Value
        this.quality_metrics.sort(function (a, b) {
          var nameA = (a['Observations'][0]).Value, nameB = (b['Observations'][0]).Value
          if (nameA < nameB)
            return -1
          if (nameA > nameB)
            return 1
          return 0
        })

        //Create Time Chart for all metrics
        this.createTimeChart()

        //Get LOD Data to compare in Radar and Bar Charts
        this.data.getLODdata().subscribe((res) => {

          this.lodDataService = res
          console.log(this.lodDataService)
          this.doubleLOD = []
          this.intLOD = []
          this.boolLOD = []
          this.NotFoundLODData = []
          let newDoubleData = []
          let newDoubleLabels = []
          let LODdataDouble = []
          let missLOD = []

          //Find LOD data for Double Metrics
          this.DoubleMetrics.map((met) => {
            this.lodDataService.map((res) => {
              let name = res.name
              if (name === met['Metric-Label']) {
                newDoubleLabels.push(met['Metric-Label'])
                newDoubleData.push(met['Observations'][0].Value)
                LODdataDouble.push(res.mean)
              }
            })
          })

          //Creating the Table Entry
          let tmp_Table: TableEntry[] = []
          this.quality_metrics.map((res) => {

            //Create temporary row
            let entry: TableEntry = {
              'Metric-Label': 'NA',
              Value: -1,
              LODAvg: -1,
              'Date-Computed': 'NA',
              'Type': 'NA',
              'Percentage': -1
            }

            //Define properties in Temporary Row
            entry['Metric-Label'] = res['Metric-Label']
            entry['Value'] = res['Observations'][0]['Value']
            entry['Date-Computed'] = res['Observations'][0]['Date-Computed']
            entry['Type'] = res['Observations'][0]['Value-Type']

            //Find LOD Data for relevant Metrics
            let lodEntry = this.lodDataService.filter(lodMetric => lodMetric.name === res['Metric-Label'])
            try {
              entry['LODAvg'] = lodEntry[0].mean
              if (entry.Type == 'Double') entry['Percentage'] = ((res['Observations'][0]['Value'] - lodEntry[0].mean) / lodEntry[0].mean) * 100
              else if (entry.Type == 'Integer') entry['Percentage'] = (res['Observations'][0]['Value'] - lodEntry[0].mean)
            } catch{
              missLOD.push(res)
            }
            //Push Row into Table Array
            tmp_Table.push(entry)
          })
          this.Table = tmp_Table
          this.sortedData = this.Table.slice()
          //FINISHED CRATING TABLE//

          console.log(LODdataDouble)
          console.log(missLOD)
          console.log(newDoubleData)
          console.log(newDoubleLabels)
          this.NotFoundLODData = missLOD

          //Check wether its the first time creating chart or not (chartjs behaves badly when you recreate element, instead we used update function)
          if (this.RadarCounter++ == 0)
            this.loadRadar(newDoubleLabels, newDoubleData, LODdataDouble)
          else this.addData(this.radarChart, newDoubleLabels, newDoubleData, LODdataDouble)

          if (this.BarCounter++ == 0)
            this.loadBar(newDoubleLabels, newDoubleData, LODdataDouble)
          else this.addData(this.barChart, newDoubleLabels, newDoubleData, LODdataDouble)
        })
      })
  }

  loadRadar(rlabels, rdata, loddata) {
    this.radarChart = new Chart('radar1',
      {
        "type": "radar",
        "data":
        {
          "labels": rlabels,
          "datasets": [
            {
              "label": this.label, "data": rdata,
              "fill": true, "backgroundColor": "rgba(255, 99, 132, 0.2)",
              "borderColor": "rgb(255, 99, 132)",
              "pointBackgroundColor": "rgb(255, 99, 132)",
              "pointBorderColor": "#fff",
              "pointHoverBackgroundColor": "#fff",
              "pointHoverBorderColor": "rgb(255, 99, 132)"
            },
            {
              "label": "LOD Average Data",
              "data": loddata,
              "fill": true,
              "backgroundColor": "rgba(54, 162, 235, 0.2)",
              "borderColor": "rgb(54, 162, 235)",
              "pointBackgroundColor": "rgb(54, 162, 235)",
              "pointBorderColor": "#fff",
              "pointHoverBackgroundColor": "#fff",
              "pointHoverBorderColor": "rgb(54, 162, 235)"
            }]
        },
        "options":
        {
          "elements":
          {
            "line":
            {
              "tension": 0,
              "borderWidth": 3
            }
          }
        }
      })

  }

  loadBar(rlabels, rdata, loddata) {
    this.barChart = new Chart('bar1',
      {
        "type": "bar",
        "data":
        {
          "labels": rlabels,
          "datasets": [
            {
              "label": this.label, "data": rdata,
              "fill": true, "backgroundColor": "rgba(255, 99, 132, 0.2)",
              "borderColor": "rgb(255, 99, 132)",
              "pointBackgroundColor": "rgb(255, 99, 132)",
              "pointBorderColor": "#fff",
              "pointHoverBackgroundColor": "#fff",
              "pointHoverBorderColor": "rgb(255, 99, 132)"
            },

            {
              "label": "LOD Average Data",
              "data": loddata,
              "fill": true,
              "backgroundColor": "rgba(54, 162, 235, 0.2)",
              "borderColor": "rgb(54, 162, 235)",
              "pointBackgroundColor": "rgb(54, 162, 235)",
              "pointBorderColor": "#fff",
              "pointHoverBackgroundColor": "#fff",
              "pointHoverBorderColor": "rgb(54, 162, 235)"
            }]
        },
        "options":
        {
          "elements":
          {
            "line":
            {
              "tension": 0,
              "borderWidth": 3
            }
          },
          "scales": {
            "xAxes": [{
              "ticks": {
                "autoSkip": false
              }
            }]
          }
        }
      })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MetricDialogComponent, {
      width: '800px',
      data: { metrics: this.quality_metrics }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
      if (result) this.quality_metrics = result;
    });
  }

  //Send what metric we are currently on to Data Service
  newMetricProfile(label) {
    this.showProfilePage = true
    this.data.changeMetricName(label)
    this.data.changeTableMetrics(this.DatasetTable)

  }

  //Filter Metrics Option
  filter() {
    console.log('working')
    console.log(this.double_minForm.value)
    console.log(this.double_maxForm.value)
    console.log(this.int_minForm.value)
    console.log(this.int_maxForm.value)
    console.log(this.ShowBooleansVal)

    let arr = []

    //Create new metrics array satusfying constraint inputted by user
    for (let qm in this.quality_metrics) {
      for (let c in this.CategoriesF.value) {
        if (this.CategoriesF.value[c] == this.quality_metrics[qm].Category) {
          console.log(`Found category ${this.quality_metrics[qm]}`)
          for (let d in this.DimensionsF.value) {
            if (this.DimensionsF.value[d] == this.quality_metrics[qm].Dimension) {

              console.log(`Found dimension ${this.quality_metrics[qm]}`)
              let mVal = this.quality_metrics[qm].Observations[0].Value
              let mType = this.quality_metrics[qm].Observations[0]['Value-Type']

              if (mType === 'Double') {
                if (mVal >= this.double_minForm.value && mVal <= this.double_maxForm.value) {
                  console.log(`Found values ${this.quality_metrics[qm]}`)
                  arr.push(this.quality_metrics[qm])
                }
              }
              else if (mType === 'Integer') {
                if (mVal >= this.int_minForm.value && mVal <= this.int_maxForm.value) {
                  console.log(`Found values ${this.quality_metrics[qm]}`)
                  arr.push(this.quality_metrics[qm])
                }
              }
              else if (mType === 'Boolean') {
                if (mVal === this.ShowBooleansVal)
                  arr.push(this.quality_metrics[qm])
              }
            }
          }
        }
      }
    }
    this.Filteredmetrics = arr
    console.log(this.Filteredmetrics)
  }

  //Redefine metrics on view when user selects different date of assessment and the relevant Metric Values
  newDate(date) {
    console.log(date)
    this.data.MetricsForDated(this.label, date).subscribe(
      (data) => {
        let threshVal = 0
        console.log(data)
        this.quality_metrics = data.Metrics

        for (let i in this.quality_metrics) {

          if (this.quality_metrics[i]['Metric-Label'] === 'Syntax Error')
            if (this.quality_metrics[i].Observations[0]['Value'] == 1) this.Syntax_boolean = true

          console.log(this.quality_metrics[i].Observations[0]['Value-Type'])
          if (this.quality_metrics[i].Observations[0]['Value-Type'] === "Double")
            this.quality_metrics[i].Observations[0]['Value'] = this.quality_metrics[i].Observations[0]['Value'] * 100

          if (this.quality_metrics[i].Observations[0]['Value-Type'] === 'Double') threshVal = 100
          else if (this.quality_metrics[i].Observations[0]['Value-Type'] === 'Integer') threshVal = 1000
          else if (this.quality_metrics[i].Observations[0]['Value-Type'] === 'Boolean') threshVal = 0
          else threshVal = 0

          Object.defineProperty(this.quality_metrics[i], 'weight', {
            value: threshVal,
            writable: true,
            configurable: true
          })
        }
        console.log(this.quality_metrics)

        this.DoubleMetrics = []
        this.IntMetrics = []
        this.BooleanMetrics = []

        this.quality_metrics.map((res) => {

          let MetricType = res.Observations[0]['Value-Type']
          if (MetricType === 'Double') {
            this.DoubleMetrics.push(res)
          }
          else if (MetricType === 'Integer') {
            this.IntMetrics.push(res)
          }
          else if (MetricType === 'Boolean') {
            this.BooleanMetrics.push(res)
          }
        })

        console.log('Sectioning')
        console.log(this.DoubleMetrics)
        console.log(this.IntMetrics)
        console.log(this.BooleanMetrics)


        //Recreate Charts for specific assessment dates metrics
        let doubleLabels = this.DoubleMetrics.map(res => res['Metric-Label'])
        let doubleData = this.DoubleMetrics.map(res => res.Observations[0]['Value'])

        console.log('Double Labels and Data')
        console.log(doubleLabels)
        console.log(doubleData)

        this.rlabels1 = this.quality_metrics.map((res) => {
          return res['Metric-Label']
        })
        this.rdata1 = this.quality_metrics.map((res) => {
          console.log((res['Observations'][0]).Value)
          if ((res['Observations'][0]).Value <= 100) return (res['Observations'][0]).Value
          else return 50
        })

        this.labelMetrics = this.rdata1
        console.log(`rlabels: ${this.rlabels1.length} ${this.rlabels1}`)
        console.log(`rdata: ${this.rdata1}`)

        //Sorting Metrics in Ascending Order of Value
        this.quality_metrics.sort(function (a, b) {
          var nameA = (a['Observations'][0]).Value, nameB = (b['Observations'][0]).Value
          if (nameA < nameB)
            return -1
          if (nameA > nameB)
            return 1
          return 0
        })


        this.data.getLODdata().subscribe((res) => {

          this.lodDataService = res
          console.log(this.lodDataService)
          this.doubleLOD = []
          this.intLOD = []
          this.boolLOD = []
          let newDoubleData = []
          let newDoubleLabels = []
          let LODdataDouble = []
          let missLOD = []

          this.DoubleMetrics.map((met) => {
            this.lodDataService.map((res) => {
              let name = res.name
              if (name === met['Metric-Label']) {
                newDoubleLabels.push(met['Metric-Label'])
                newDoubleData.push(met['Observations'][0].Value)
                LODdataDouble.push(res.mean)
              }
            })
          })

          //Creating the Table Entry
          let tmp_Table: TableEntry[] = []
          this.quality_metrics.map((res) => {
            let entry: TableEntry = {
              'Metric-Label': 'NA',
              Value: -1,
              LODAvg: -1,
              'Date-Computed': 'NA',
              'Type': 'NA',
              'Percentage': -1
            }

            entry['Metric-Label'] = res['Metric-Label']
            entry['Value'] = res['Observations'][0]['Value']
            entry['Date-Computed'] = res['Observations'][0]['Date-Computed']
            entry['Type'] = res['Observations'][0]['Value-Type']
            let lodEntry = this.lodDataService.filter(lodMetric => lodMetric.name === res['Metric-Label'])
            try {
              entry['LODAvg'] = lodEntry[0].mean
              if (entry.Type == 'Double') entry['Percentage'] = ((res['Observations'][0]['Value'] - lodEntry[0].mean) / lodEntry[0].mean) * 100
              else if (entry.Type == 'Integer') entry['Percentage'] = (res['Observations'][0]['Value'] - lodEntry[0].mean)
            } catch{
              missLOD.push(res)
            }
            console.log(entry)
            tmp_Table.push(entry)
          })
          console.log(tmp_Table)
          this.Table = tmp_Table
          // Finished Creating Table array //

          console.log(LODdataDouble)
          console.log(missLOD)
          console.log(newDoubleData)
          console.log(newDoubleLabels)
          this.NotFoundLODData = missLOD

          if (this.RadarCounter++ == 0)
            this.loadRadar(newDoubleLabels, newDoubleData, LODdataDouble)
          else this.addData(this.radarChart, newDoubleLabels, newDoubleData, LODdataDouble)

          if (this.BarCounter++ == 0)
            this.loadBar(newDoubleLabels, newDoubleData, LODdataDouble)
          else this.addData(this.barChart, newDoubleLabels, newDoubleData, LODdataDouble)
        })
      })
  }

  addData(chart, labels, data, LOD_Data) {
    try {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data
      chart.data.datasets[1].data = LOD_Data
      chart.update();
    } catch (err) {
      console.log(err)
    }
  }

  precise(x) {
    return Number.parseFloat(x).toFixed(2);
  }

  boolValue(val) {
    if (val == 1) return 'true'
    else return 'false'
  }

  booleanBar(currentVal, threshVal) {
    if (currentVal === threshVal) return 100
    else return 0
  }

  exists(label) {
    try {
      let arr = this.CategoriesF.value.filter(res => res == label)
      if (arr.length > 0) return false
      else return true
    } catch (err) {
      //console.log(err)
      return false
    }
  }

  SelectedCatF() {
    try {
      if (this.CategoriesF != undefined) {
        if (this.CategoriesF.value.length > 0)
          return false
        else return true
      }
      else return false
    } catch {
      return false
    }

  }

  newChoice(visType) {
    console.log(visType)
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  createTimeChart() {

    //DoubleMetrics at this point has the metrics we need to display, so we create the first array of datasets
    let datasetsTime: TimeGraphData[] = []

    this.DoubleMetrics.map((res) => {
      var tmp: TimeGraphData = {
        label: res['Metric-Label'],
        borderColor: this.getRandomColor(),
        fill: false,
        data: []
      }

      datasetsTime.push(tmp)

    })
    console.log(datasetsTime)

    //Go through AssessDates and fill coordinate points
    this.DatesCall(datasetsTime, 0)


  }

  //Function recursively called to create a Line Chart of all Metrics over time
  DatesCall(TimeSets, r) {
    //Receive metrics for specific date
    this.data.MetricsForDated(this.label, this.AssessDates[r]).subscribe((data) => {
      console.log(data)
      let x = this.AssessDates[r]
      TimeSets.map((ts_metric) => {
        data['Metrics'].map((rd_metric) => {
          if (ts_metric.label === rd_metric['Metric-Label']) {
            let coordinate: Coordinate = {
              x: x,
              y: rd_metric.Observations[0]['Value'] * 100
            }
            ts_metric.data.push(coordinate)
          }
        })
      })
      r += 1
      if (r < this.AssessDates.length) this.DatesCall(TimeSets, r)
      else if (r == this.AssessDates.length) {
        console.log(TimeSets)
        this.createTimeGraph(TimeSets)
      }
    })

  }

  createTimeGraph(TimeData) {
    this.TimeChart = new Chart('timeChart', {

      type: 'line',
      data: {
        labels: this.AssessDates,
        datasets: TimeData
      },
      options: {
        scaleShowvalues: true,
        legend: {
          display: true
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'value'
            }
          }]
        }
      }
    })

  }

  //Sort Table data in Details Page
  sortData(sort) {
    const data = this.Table.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Metric-Label': return compare(a['Metric-Label'], b['Metric-Label'], isAsc);
        case 'Value': return compare(a.Value, b.Value, isAsc);
        case 'LODAvg': return compare(a.LODAvg, b.LODAvg, isAsc);
        case 'Percentage': return compare(a.Percentage, b.Percentage, isAsc);
        case 'Type': return compare(a.Type, b.Type, isAsc);
        case 'Date-Computed': return compare(a['Date-Computed'], b['Date-Computed'], isAsc);
        default: return 0;
      }
    });
  }

  //Helper Functions to parse display data in table
  getValue(val: number) {
    if (val == -1) return 'NA'
    else return val
  }

  getStyle(entry) {
    if (entry.Type === 'Boolean') {
      if (entry.Value == false)
        return '#dd4a4a'
      else return '#70bd79'
    }
  }

  getPercentage(entry: TableEntry) {
    if (entry.Type == 'Double' && entry.LODAvg >= 0) {
      if (entry.Percentage < 0) return ((entry.Percentage).toFixed(2) + ' %')
      else if (entry.Percentage > 0) return ((entry.Percentage).toFixed(2) + ' %')
      else if (entry.Percentage == 0) return 'Equal'
    }
    if (entry.Type == 'Integer' && entry.LODAvg >= 0) {
      if (entry.Percentage < 0) return (entry.Percentage).toFixed(2)
      else if (entry.Percentage > 0) return (entry.Percentage).toFixed(2)
      else if (entry.Percentage == 0) return 'Equal'
    }
    else return '-'
  }

  getPercentStyle(entry: TableEntry) {
    if (entry.Type === 'Double' || entry.Type === 'Integer') {
      if (entry.Percentage < 0) return '#dd4a4a'
      else if (entry.Percentage >= 0) return '#70bd79'
    }
  }

  //Downloads DAQ file of dataset
  getDAQMetadata() {
    this.data.getDAQMetadata(this.label).subscribe((res) => {
      var blob = new Blob([res], { type: "application/trig" });
      saveAs(blob, 'DAQ-' + this.label + '.trig');
    })
  }

  //Downloads DQV file of dataset
  getDQVMetadata() {
    this.data.getDAQMetadata(this.label).subscribe((res) => {
      var blob = new Blob([res], { type: "application/trig" });
      saveAs(blob, 'DQV_' + this.label + '.trig');
    })
  }

  //Creating Array of metrics for Ranked Datasets Above and Below
  getDatasetMetrics(c: number) {

    let indexes = []
    let below = 0
    let above = 0
    let count = 0
    below = c
    above = c

    while (below > 0 && count < 2) {
      count++
      below -= 1
      console.log(below + ' Index')
      indexes.push(below)
      indexes.sort()
    }

    indexes.push(c)
    count = 0
    console.log(this.RankedUsers.length)

    while (above < this.RankedUsers.length && count < 2) {
      count++
      above += 1
      console.log(above + ' Index')
      indexes.push(above)
    }

    console.log(indexes)
    this.getMetrics(indexes, below, above)
  }

  //Create and Send metrics array of ranked datasets above and below in data service
  getMetrics(indexes: any[], b, a) {
    let TableDatasets: TableMetrics[] = []
    this.MetricsCall(TableDatasets, 0, b, a, indexes)
    // let TableDatasets: TableMetrics[] = []
    // let s = 0
    // for (var i = 0; i < (a-b)+1; i++) {
    //   this.vdata.vsQuality(this.RankedUsers[indexes[s]]['Dataset-PLD']).subscribe((data) => {
    //     let tmp: TableMetrics = {
    //       Dataset_PLD: this.RankedUsers[indexes[s++]],
    //       Metrics: data.Metrics
    //     }
    //     TableDatasets.push(tmp)
    //   })
    // }

    // this.DatasetTable = TableDatasets
    // console.log(TableDatasets)
    // console.log(Table_metrics)

    // //Add to Tablemetrics Observable in Service
    // this.data.changeTableMetrics(TableDatasets)
  }

  MetricsCall(TableDatasets, current_index, below, above, indexes) {
    //Receive metrics for specific date

    this.vdata.vsQuality(this.RankedUsers[indexes[current_index]]['Dataset-PLD']).subscribe((data) => {
      let tmp: TableMetrics = {
        Dataset_PLD: this.RankedUsers[indexes[current_index]],
        Metrics: data.Metrics
      }
      console.log(this.RankedUsers[current_index]['Da'])
      console.log('Current Index ' + current_index)
      console.log('Table ' + TableDatasets)
      console.log('Indexes ' + indexes + ' ' + above + ' ' + below)
      TableDatasets.push(tmp)
      if (current_index < (above - below)) this.MetricsCall(TableDatasets, current_index+=1, below, above, indexes)
      else {
        console.log('Done calling MetricsCall Recursily')
        console.log(TableDatasets)
        this.DatasetTable = TableDatasets
        this.data.changeTableMetrics(TableDatasets)
      }
    })
  }
}

//Function outside constructor, prevents use of this.compare to use function
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}









