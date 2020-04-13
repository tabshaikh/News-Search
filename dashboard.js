(function () {
    'use strict'
    feather.replace()
}())

var authKey = "xrp7NPZMKRQ3U8nmHM5UMXu2XwBKYXei";
var queryURLBase = "https://api.nytimes.com/svc/search/v2/articlesearch.json?q="

var state = {
    'page': 0,
    'rows': 10,
    'window': 5,
}

function runQuery(queryURL){
	let articleCounter = 0;
	$.ajax({url: queryURL, method: "GET", error: function (request, status, error) {alert("Error in loading Table: "+error+" to API")}}) 
		.done(function(NYTData) {
			$("#wellSection").html("");
			// Here we are logging the URL so we have access to it for troubleshooting
			// console.log("------------------------------------")
			// console.log("URL: " + queryURL);
			// console.log("------------------------------------")
			// console.log(NYTData);
			// console.log("------------------------------------")		
				for (var i=0; i<10; i++) {
					articleCounter++;
					var wellSection = $("<tr></tr>");
					wellSection.attr('id', 'articleWell-' + articleCounter)
					$('#wellSection').append(wellSection);
					$("#articleWell-"+ articleCounter).append('<td>' + NYTData.response.docs[i].pub_date.substring(0,10) + "</td>");
					$("#articleWell-"+ articleCounter).append('<td>' + NYTData.response.docs[i].headline.main + "</td>");
					$("#articleWell-"+ articleCounter).append('<td>' + NYTData.response.docs[i].abstract + "</td>");
					$("#articleWell-"+ articleCounter).append('<td><a target="_blank" href="' + NYTData.response.docs[i].web_url + "\">"+ NYTData.response.docs[i].web_url +"</a></td>");
					$("#articleWell-"+ articleCounter).append('<td>' + NYTData.response.docs[i].source + "</td>");
			}
		}); 
}

function displayGraph(searchTerm){
	let stats_data = [0,0,0,0,0];
	const iterate = ['2016','2017','2018','2019','2020'];
	for(let value of iterate){
		let checkURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json?fq="+searchTerm+"&begin_date="+value+"0101&end_date="+value+"1231&api-key="+authKey;
		//console.log(checkURL);
		$.ajax({url: checkURL, method: "GET", error: function (request, status, error) {console.log(0);stats_data.push(0);alert("Error in loading Chart: "+error+" to API")}}) 
		.done(function(NYTData) {
			// console.log("------------------------------------")
			// console.log(NYTData);
			// console.log("------------------------------------")
			// stats_data.push(NYTData.response.meta.hits);
			stats_data[parseInt(value)-2016] = NYTData.response.meta.hits;
			myChart.update();
		});
	}
		
		var ctx = document.getElementById('myChart')
			var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: iterate,
				datasets: [{
				data: stats_data,
				lineTension: 0,
				backgroundColor: 'transparent',
				borderColor: '#007bff',
				borderWidth: 4,
				pointBackgroundColor: '#007bff'
				}]
			},
			options: {
				title: {
					display: true,
					text: 'NUMBER OF ARTICLES PUBLISHED FOR "'+searchTerm+'"',
					position: 'top',
					fontSize: 20
				},
				scales: {
				yAxes: [{
					ticks: {
					beginAtZero: false
					}
				}]
				},
				legend: {
				display: false
				}
			}
			})
}

function addPagination(searchTerm){
	document.getElementById("pagination-wrapper").innerHTML=`
	<ul class="pagination">
	<li class="page-item page-pre" ><a class="page-link" aria-label="previous page" href="javascript:void(0)">‹</a></li>
	<li class="page-item vale vale1 active" value="1"><a class="page-link" aria-label="to page 1" href="javascript:void(0)">1</a></li>
	<li class="page-item vale vale2" value="2"><a class="page-link" aria-label="to page 2" href="javascript:void(0)">2</a></li>
	<li class="page-item vale vale3" value="3"><a class="page-link" aria-label="to page 3" href="javascript:void(0)">3</a></li>
	<li class="page-item vale vale4" value="4"><a class="page-link" aria-label="to page 4" href="javascript:void(0)">4</a></li>
	<li class="page-item vale vale5" value="5"><a class="page-link" aria-label="to page 5" href="javascript:void(0)">5</a></li>
	<li class="page-item page-next"><a class="page-link" aria-label="next page" href="javascript:void(0)">›</a></li>
	</ul>`;
	$('.page-item').on('click', function() {
		if(this.className == "page-item page-pre"){
			let current1 = document.getElementsByClassName("vale");
			if(current1[0].value!=1){
				for(let i=0;i<=4;i++){
					current1[i].value = current1[i].value - 5;
					current1[i].innerHTML=`<a class="page-link" aria-label="to page `+current1[i].value+`" href="javascript:void(0)">`+current1[i].value+`</a>`;
				}
			}
			console.log("Pre clicked");
		}
		else if(this.className == "page-item page-next"){
			let current1 = document.getElementsByClassName("vale");
			if(current1[4].value!=100){
				for(let i=0;i<=4;i++){
					current1[i].value = current1[i].value + 5;
					current1[i].innerHTML=`<a class="page-link" aria-label="to page `+current1[i].value+`" href="javascript:void(0)">`+current1[i].value+`</a>`;
				}
			}
			console.log("Next clicked");
		}
		else{
		state.page = Number($(this).val())-1
		var current = document.getElementsByClassName("page-item active");
		console.log(current[0])
		current[0].className = current[0].className.replace(" active", "");
		this.className+=" active";
		var queryURL2 = queryURLBase + searchTerm +"&sort=newest"+"&page="+state.page+"&api-key="+authKey;
		buildtable(queryURL2);
		}
	})
}

function buildtable(queryURL1){
	document.getElementById("our-table").innerHTML = '<thead><tr><th width="150px">Published Date</th><th>Headline</th><th>Summary</th><th>URL</th><th>Source</th></tr></thead><tbody id="wellSection"></tbody>';
	runQuery(queryURL1);
}

$('.runSearch').on('click', function(){
  event.preventDefault();
  var searchTerm = $('.searchTerm').val().trim();
  document.getElementById("our-table").innerHTML="";
  state.page = 0;
  var queryURL = queryURLBase + searchTerm +"&sort=newest"+"&page="+state.page+"&api-key="+authKey;
  document.getElementById("dashboard").innerHTML = "<strong>Here are your search results for \""+searchTerm+"\"</strong>";
  document.getElementById("table-heading").innerHTML = "<strong>ARTICLES</strong>";
  console.log(queryURL);
  buildtable(queryURL);
  displayGraph(searchTerm);
  addPagination(searchTerm);
  return false;
});	