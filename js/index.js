$(document).ready(function(){
  creategraph();
  var $table=$('#country_table');
  var $Country=$('#country_Name');
  var $Sugar=$('#sugar_Value');
  var $Salt=$('#salt_Value');

    $.ajax({
        type:'GET',
        url:'http://localhost:3000/name',
        dataType:'json',
        success:function(data){
            $.each(data,function(key,value){
                $table.append('<tr><td>'+value.Country+'</td><td>'+value.Sugar+'</td><td>'+value.Salt+
                    '</td><td><button id="'+value.Country+'" type="button" class="remove">delete</button></td></tr>');

        
          
        });
      }
       
    });

      

    $('#add_value').on('click',function(){
        var item={
            Country: $Country.val(),
            Sugar: parseFloat($Sugar.val()),
            Salt: parseFloat($Salt.val()),
        }
        
        $.ajax({
            type:'POST',
            url:'http://localhost:3000/name',
            data:item,
            contentType:"application/json; charset=utf-8",
            data:JSON.stringify(item),
            dataType:"json",
            success: function(newValue){
                
                $table.append('<tr><td>'+newValue.Country+'</td><td>'+Number(newValue.Sugar)+'</td><td>'
                    +Number(newValue.Salt)+'</td><td><button id="'+newValue.Country+ '" type="button" class="remove">delete</button></td></tr>');
             $('svg').remove();
             creategraph();

            },
            error:function(){
                alert("error saving values");
            }

           
        });
         $Country.val('');
            $Sugar.val('');
            $Salt.val('');
      });


    $table.delegate('.remove','click',function()
    {
        var $tr = $(this).closest('tr');
        $.ajax({
            type:'DELETE',
            url:'http://localhost:3000/name/'+$(this).attr('id'),
            success:function(){
                $tr.remove();
                $('svg').remove();
                creategraph();
            }
        });
    });



    function creategraph()
    {
    var margin={top:20, bottom:100, left:40, right:90},
    width=600-margin.left-margin.right,
    height=500-margin.top-margin.bottom;

    var horizontal=d3.scale.ordinal().rangeRoundBands([0,width],0.12),
    vertical=d3.scale.linear().rangeRound([height,0]);

    var color = d3.scale.ordinal()
    .range(["#98abc5",  "#ff8c00"]);

    var xAxis=d3.svg.axis()
    .scale(horizontal)
    .orient("bottom");

    var yAxis=d3.svg.axis()
    .scale(vertical)
    .orient("left");

    var svg=d3.select("#addgraph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

      d3.json("http://localhost:3000/name",function(err,data){

      if(err)
          console.log("error");
        
      data.forEach(function(d)
      {
        d.Country=d.Country;
        d.Salt=parseInt(d.Salt);
        d.Sugar=parseInt(d.Sugar);
      });
    var xData=["Sugar","Salt"];
    var dataIntermediate = xData.map(function (c) 
        {
            return data.map(function (d) 
            {
                return {x: d.Country, y: d[c]};
            });
        });
    var dataStackLayout = d3.layout.stack()(dataIntermediate);

    horizontal.domain(dataStackLayout[0].map(function (d) 
    {
        return d.x;
    }));
    vertical.domain([0,
        d3.max(dataStackLayout[dataStackLayout.length - 1],
                  function (d) { return d.y0 + d.y;})
      ])
  
      .nice();
    var layer = svg.selectAll(".stack")
          .data(dataStackLayout)
          .enter().append("g")
          .attr("class", "stack")
          .style("fill", function (d, i) {
                return color(i);
    });

  layer.selectAll("rect")
        .data(function (d) 
        {
            return d;
        })
        .enter().append("rect")
          .attr("height",0)
          .attr("y",height)
          .transition().duration(3000)
          .delay(function(d,i) { return i*200;})
        .attr("x", function (d) {
            return horizontal(d.x);
          })
          .attr("y", function (d) {
              return vertical(d.y + d.y0);
          })
          .attr("height", function (d) {
              return vertical(d.y0) - vertical(d.y + d.y0);
        })
      .attr("width", horizontal.rangeBand());

  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "translate(" + width + ",0)")
      .attr("transform","rotate(-75)")
      .attr("dy","-0.5em")
       .attr("dx","-.60em")
       .style("font-size","15px")
       .style("font-weight","bold")
       .style("color","red")
       .style("text-anchor","end")
       // .text("Countries");

  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", "520")
      .attr("y", "400")
      .style('fill', 'black')
      .style("font-size", "15px")
      .text("countries");

  svg.append("g")
        .attr("class", "axis")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy","1em")
            .style("text-anchor", "end")
            .style("font-size","12px")
            .style("font-weight","bold")
            .style("color","red")
            .text("Sugar,Salt")
            .style("font-weight","bold");

  var mar = svg.selectAll(".corner")
         .data(color.domain())
         .enter().append("g")
         .attr("class", "corner")
         .attr("transform", function(d, i) { return "translate(0," + i * 20 +
            ")"; });


     mar.append("rect")
           .attr("x", width - 10)
           .attr("width", 18)
           .attr("height", 18)
           .style("fill", color);

     mar.append("text")
         .attr("x", width - 24)
         .attr("y", 9)
         .attr("dy", ".35em")
         .style("text-anchor", "end")
         .style("fill","green")
         .text(function(d,i) { return xData[i]; });

  });
   
    }

});