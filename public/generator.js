var siteswap = require('siteswap-generator');
$(document).ready(function(){
	$("#gif").hide()
})
const makeTable = (data) => {
	var table = ''
	//data[i].join("") will remove commas from array, ex: [5,3,4] becomes 534
	for(var i = 0; i < data.length; i++){
		if(i%4 == 0 && i == 0){
			table += "<div class='row'><div class='col'><figure class='figure'><img class='figure-img img-fluid rounded' src=https://jugglinglab.org/anim?pattern="+data[i].join("")+";redirect=true><figcaption class='figure-caption text-center'>"+data[i].join("")+"</figcaption></figure></div>"
		}else if(i%4 == 0 && i != 0){
			table += "</div><div class='row'><div class='col'><figure class='figure'><img class='figure-img img-fluid rounded' src=https://jugglinglab.org/anim?pattern="+data[i].join("")+";redirect=true><figcaption class='figure-caption text-center'>"+data[i].join("")+"</figcaption></figure></div>"
		}else{
			table += "<div class='col'><figure class='figure'><img class='figure-img img-fluid rounded' src=https://jugglinglab.org/anim?pattern="+data[i].join("")+";redirect=true><figcaption class='figure-caption text-center'>"+data[i].join("")+"</figcaption></figure></div>"
		}
		if(i >= 25)
			break;
	}
	table += "</div>"
	console.log(table)
	$("#pattern-table").empty()
	$("#pattern-table").append(table)
}
$("#submit").click(function(){
	$("#gif").show()
	var url = "https://jugglinglab.org/anim?"
	var notation = document.querySelector('#pattern').value
	var slowdown = document.querySelector('#slowdown').value
	var diam = document.querySelector('#diameter').value
	console.log(url+notation)
	$("#gif").attr("src",url+"pattern="+notation+";border=15;slowdown="+slowdown+";propdiam="+diam+";redirect=true")
	console.log(url+"pattern="+notation+";border=3;slowdown="+slowdown+";propdiam="+diam+";redirect=true")
	$("label").hide
})

$("#generator").click(function(){ // This works, but can cause rendering errors. Try getting all images first so they load, then return that to the page.
	var maxballs = document.querySelector('#numballs').value
	var maxperiod = document.querySelector('#period').value
	var maxheight = document.querySelector('#maxheight').value
	var patterns = siteswap.Generator({
		balls : parseInt(maxballs),
		period: parseInt(maxperiod),
		height: parseInt(maxheight)
	})
	console.log(patterns)
	makeTable(patterns)
})

