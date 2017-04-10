function intervalStart() {
  var now = new Date()
  now.setDate(now.getDate() - 1)
  return now.toISOString()
}
function emptyResults(data) { return data[1] == 0 }
function updateBac(bac) { $('.interval .bac').text(bac) }
function updateBacUnits(units) { $('.interval .bac-units').text(units) }
function showInActiveContents() { $('.inactive').show(); $('.statistics').hide(); $('.interval .servingstable').hide() }
function showActiveContents() { $('.inactive').hide(); $('.statistics').show(); $('.interval .servingstable').show() }

function fetchCurrentInterval() {
  var tableBody = $('.interval table tbody')
  tableBody.empty("").append('<tr colspan="3"><td><div class="busy"></div></td></tr>')
  var params = { start:intervalStart() }
  var servings = $.ajaxAsObservable({ url: "api/servings-interval", data: params}).publish()
  servings.connect()
  handleUnauthorized(servings)
  var rows = servings.catch(Rx.Observable.never()).select(resultData)
    .select(function(data) { return [$.map(data.servings, function(s) { return $.parseJSON(s)}), data.count, data.bac, data.units] })
    .catch(Rx.Observable.never())
  rows.subscribe(function(x) { tableBody.empty("").hide(); showActiveContents(); addServingsToTable(tableBody, x[0]); updateBac(x[2], updateBacUnits(x[3])); tableBody.fadeIn() })
  rows.where(emptyResults).subscribe(showInActiveContents)
}

$(function() {
  updateLoggedIn()
  fetchCurrentInterval()
})
