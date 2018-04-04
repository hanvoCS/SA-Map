
/*-------------Model----------------*/ 
var locations = [
    {city:"Riyadh", location :{lat: 24.713553, lng: 46.675286}},
    {city:"Jeddah", location :{lat: 21.285407, lng: 39.237551}},
    {city:"Medina", location :{lat: 24.524654, lng: 39.569184}},
    {city:"Dammam", location :{lat: 26.392667, lng: 49.977714}},
    {city:"Mecca", location :{lat: 21.388909, lng: 39.857841}},
];

var map, infoWindow, bounds;


/*---------google maps init-----------*/ 
function initMap() {
   
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 24.713553, lng: 46.675286},
        mapTypeControl: false
    });
        // info window declaration 
    infoWindow = new google.maps.InfoWindow();
      //For adjusting the boundaries of the map to fit everything
    bounds = new google.maps.LatLngBounds();
   
}

// for handling google map error
function MapError(){
    alert('Error in Google Map!');
}

 
var LocationMarker = function(data) {
  
         // set position and city values   
    var self = this;
    self.title = data.city;
    self.position = data.location;
//console.log(this.title)

    // Create a marker per location, and put into markers array
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.city,
        animation: google.maps.Animation.DROP,
    });  
    
   

      self.marker.setMap(map);
      bounds.extend(self.marker.position);
      map.fitBounds(bounds);
      
    
    // show info window when you click on marker
    this.marker.addListener('click', function() {
        ShowInfoWindow(this,infoWindow, data.city);
        map.panTo(this.getPosition());
        this.setAnimation(google.maps.Animation.BOUNCE);  
                  setTimeout((function() 
                  {
                       this.setAnimation(null);
                  }).bind(this), 2000);
             
      
    });

     // close the infoWindow when user click on the map 
     map.addListener("click", function()
     {
       infoWindow.close();
     });
 
  // show info window when the user select from list
    this.showInfo = function() {
        ShowInfoWindow(this.marker ,infoWindow , data.city );
        this.marker.setAnimation(google.maps.Animation.BOUNCE);  
        setTimeout((function() 
        {
            this.marker.setAnimation(null);
                }).bind(this), 2000);
   
    };  



};

/*-------Show InfoWindow function--------*/

function   ShowInfoWindow (marker,info,city)
{    
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+city+'&format=json&callback=wikiCallback';
   


   
$.ajax(
      { 
  url:wikiUrl,
  dataType:"jsonp",
  success:function (response)
              {
                      var articleList = response[1];
                    // get first artical about the city 
                      var url = "https://en.wikipedia.org/wiki/"+articleList[0];
       
                    //check to make sure the info window  
                     if (info.marker != marker){
                        info.marker = marker;
                        info.setContent('<div><br><p>Information about '+city+': <a href="'+url+'">Here</a></p></div>');
                        info.open(map,marker);
           
                      //marker cleared if the info window is closed
                     info.addListener('closeclick', function() {
            info.marker = null;
        });
                        }
                              
                   
                       
               }

       }).fail(function() { // for handling error
        alert( "failed to get wikipedia resources" );
      });
             
       
    }



/*-----------View Model-------------*/ 

var viewModel = function() {
    var self = this;

    this.query = ko.observable('');

    this.locationList = ko.observableArray([]);

    // add marker for each location
    locations.forEach(function(location) {
        self.locationList.push( new LocationMarker(location) );
    });

   this.locationsLST = ko.computed(function() { 
        var search = self.query().toLowerCase();
       return ko.utils.arrayFilter(self.locationList(), function(location) {       
           var myLocation= location.title.toLowerCase().indexOf(search) >= 0;
        
           //console.log(location.hasOwnProperty('marker'))
           if(location.hasOwnProperty('marker'))
          location.marker.setVisible(myLocation);
           return myLocation; 
               });
       
       }, viewModel);     
};



function StartApp(){

    initMap();
    ko.applyBindings(new viewModel());
}