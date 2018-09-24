import { Component, OnInit } from '@angular/core';
import { VDataService } from '../v-data.service'
import { Chart } from 'chart.js';
import { map, filter } from 'rxjs/operators'
import { Observable, pipe } from 'rxjs'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { DataService } from '../data.service';
import { MatSortModule } from '@angular/material/sort';

interface notAssessed {
  Dataset: string,
  Metrics: string[]
}
interface Metric {
  Label: string,
  LatestValue: string
}

interface TableEntry {
  'Dataset-Label': string,
  'Metrics': Metric[]
}

@Component({
  selector: 'app-visualise',
  templateUrl: './visualise.component.html',
  styleUrls: ['./visualise.component.scss']
})

export class VisualiseComponent implements OnInit {

  counter = 0                           //Keep Track of Chart Counter
  response: Object

  //Contain the chart to display
  radarChartm = []
  barChartm = []
  chart = [];

  users$ = []                           //Contains most recent Ranked Users
  rlabels = []                          //Stores all metrics to be used
  rdatasets = []                        //Stores data for the radar chart
  datasetsForm = new FormControl();     //Contains the desired metrics
  metricsForm = new FormControl();      // Contains the desired datasets
  MetricsOptions = []                   //Contains the Options for metrics form
  
  //Stores Metrics that have not been assessed
  NA_Dataset_Metrics: notAssessed[] = []

  //Table of selected Datasets and Metrics
  Table: TableEntry[] = []
  sortedData: TableEntry[] = []
  showTable = false

  constructor(private _vdata: VDataService, private data: DataService) { }
  ngOnInit() {

    //Store Current Ranked Users for Multi-Select Option Bar
    this.data.currentRankedUsers.subscribe(res => this.users$ = res)

    //Store Available Metrics
    this.AvailableMetrics()

    console.log(this.users$)
  }

  message() {
    console.log(this.datasetsForm.value.map(res => res.dataset))
  }

  AvailableMetrics() {
    this.data.getFacets()
      .subscribe(
        data => {
          let posts$ = (data.Categories)
          console.log(posts$)

          for (let c in posts$) {
            for (let d in posts$[c]['Dimensions']) {
              for (let m in posts$[c]['Dimensions'][d].Metrics) {
                //Pushes all metrics for the Multi-Select Option Bar
                this.MetricsOptions.push((posts$[c]['Dimensions'][d].Metrics[m]))
              }
            }
          }
          console.log(this.MetricsOptions)
        }
      )
  }

  //Creates Radar chart for selected Datasets and Metrics
  loadRadar(rlabels, rdata) {
    console.log('Loading Radar chart...')
    console.log(rlabels)
    console.log(rdata)
    this.radarChartm = new Chart('radar1',
      {
        "type": "radar",
        "data":
        {
          "labels": rlabels,
          "datasets": rdata
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

  //Creates Bar chart for selected Datasets and Metrics
  loadBar(rlabels, rdata) {
    console.log('Loading Bar chart...')
    this.barChartm = new Chart('bar1',
      {
        "type": "bar",
        "data":
        {
          "labels": rlabels,
          "datasets": rdata
        },
        "options":
        {
          "fill": true,
          "elements":
          {
            "line":
            {
              "tension": 10,
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

  //Creates Relevant Charts and Tables for selected Datasets and Metrics
  Visualise() {
    console.log("Starting Vis...")
    let found = 0
    this.NA_Dataset_Metrics = []
    this.rdatasets = []
    this.Table = []

    // Go through every Dataset selected
    for (let d in this.datasetsForm.value) {

      
      let testdata = []
      let doubleLabels = []
      let notFound: notAssessed = {
        Dataset: this.datasetsForm.value[d]['Dataset-PLD'],
        Metrics: []
      }
      console.log(this.datasetsForm.value[d]['Dataset-PLD'])


      //Go through all metrics of selected dastaset (d)
      this._vdata.vsQuality(this.datasetsForm.value[d]['Dataset-PLD']).subscribe(
        (res) => {

          //Create Temporary Row Entry for table
          let tmp_TableEntry: TableEntry = {
            "Dataset-Label": this.datasetsForm.value[d]['Dataset-PLD'],
            "Metrics": []
          }

          //Go through every selected Metric
          for (let s in this.metricsForm.value) {

            //Create Temporary Metric object 
            let tmp_Metric: Metric = {
              Label: this.metricsForm.value[s].Label,
              LatestValue: 'NA'
            }

            //Find and add Relevant Metric Value to Metric Object
            let found = res.Metrics.filter(res => res['Metric-Label'] == this.metricsForm.value[s].Label)
            if (found.length > 0) {
              if (found[0]['Observations'][0]['Value-Type'] == 'Double') {
                tmp_Metric.LatestValue = (found[0]['Observations'][0]['Value'] * 100).toFixed(2)
                doubleLabels.push(found[0]['Metric-Label'])

                //Testdata includes data for the Radar and Bar Charts
                testdata.push(found[0]['Observations'][0]['Value'] * 100)
              }
              else tmp_Metric.LatestValue = found[0]['Observations'][0]['Value']
            }
            else {
              //If metric is not found within dataset, add it to no found list for specified dataset
              notFound.Metrics.push(this.metricsForm.value[s].Label)
            }

            tmp_TableEntry.Metrics.push(tmp_Metric)
          }

          this.Table.push(tmp_TableEntry)
          console.log(doubleLabels)
          console.log(testdata)

          //Create a random color for the dataset
          console.log(`${this.datasetsForm.value[d]['Dataset-PLD']} ${testdata}`)
          let red = Math.floor(Math.random() * (255))
          let blue = Math.floor(Math.random() * (255))
          let green = Math.floor(Math.random() * (255))

          //Create the chartjs Object for a dataset
          var tmp = {
            label: "Example",
            data: [],
            "fill": true,
            "backgroundColor": `rgba(${red}, ${green}, ${blue}, 0.2)`,
            "borderColor": `rgba(${red}, ${green}, ${blue})`,
            "pointBackgroundColor": `rgba(${red}, ${green}, ${blue})`,
            "pointBorderColor": "#fff",
            "pointHoverBackgroundColor": "#fff",
            "pointHoverBorderColor": `rgba(${red}, ${green}, ${blue})`
          };

          //Add chartjs dataset data and label values
          tmp.label = this.datasetsForm.value[d]['Dataset-PLD']
          tmp.data = testdata
          this.rdatasets.push(tmp)

          if (this.counter == 0) {
            this.loadRadar(doubleLabels, this.rdatasets)
            this.loadBar(doubleLabels, this.rdatasets)
            this.counter++
          }
          else {
            console.log('Updating charts...')
            this.addData(this.radarChartm, doubleLabels, this.rdatasets)
            this.addData(this.barChartm, doubleLabels, this.rdatasets)
          }
          this.NA_Dataset_Metrics.push(notFound)
          console.log(this.Table)
          this.sortedData = this.Table.slice()
          this.showTable = true
        })
    }
    console.log(this.NA_Dataset_Metrics)
    console.log(this.Table)
    this.sortedData = this.Table.slice()

  }

  addData(chart, label, data) {
    try {
      chart.data.labels = label;
      chart.data.datasets = data
      chart.update();
    } catch (err) {
      console.log(err)
    }
  }

  //Sorts the table of dataset and metrics upon sortChange event 
  sortData(sort) {
    const data = this.Table.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Dataset-Label': return compare(a['Dataset-Label'], b['Dataset-Label'], isAsc);
        default: {
          console.log(sort.active)
          for (var i in this.Table[0].Metrics) {
            if (this.Table[0].Metrics[i].Label === sort.active)
              break;
          }
          console.log(i)
          console.log(a.Metrics[i].LatestValue)
          return compare(a.Metrics[i].LatestValue, b.Metrics[i].LatestValue, isAsc)
        }
      }
    });
  }

}

//Function outside constructor, prevents use of this.compare to use function
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}