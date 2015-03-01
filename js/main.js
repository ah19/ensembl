// $(document).ready(function() {
//     console.log("Page loaded");
// });

var ensembl_url = "http://rest.ensembl.org";
var lookup_url = "/lookup/symbol/homo_sapiens/BRCA2?content-type=application/json;expand=1";

var Gene = Backbone.Model.extend({
    species: "homo_sapiens",
    
    url: function() {
        return ensembl_url + "/lookup/symbol/" + this.species + '/' + this.get("marker_symbol") + '?content-type=application/json;expand=1';
    },

    parse: function(data) {
        //delete data["Transcript"]["Exon"];
        //delete data["Transcript"]["Translation"];
        var transcripts = _.map(data.Transcript, function (t) {
            return { id: t.id }
        });

        console.log(transcripts);
        data.Transcript = new Transcripts( transcripts );

        //console.log(data);

        return data;
    }
});
var Transcript = Backbone.Model.extend({});
var Exon = Backbone.Model.extend({});

var Genes = Backbone.Collection.extend({
    model: Gene
});
var Transcripts = Backbone.Collection.extend({
    model: Transcript
});
var Exons = Backbone.Collection.extend({
    model: Exon
});

var Search = Backbone.View.extend({
    el: $("#main"),
    template: _.template( $("#search_view").html() ),

    events: {
        'click button#search': 'search',
        'click button#seq_search' : 'seq_search'
    },
    initialize: function () {
        _.bindAll(this, 'render');

        this.render();
    },

    render: function () {
        this.$el.html( this.template() );

        return this;
    },

    search: function () {
        var text = $("#gene").val();
        if ( text.length == 0 ) {
            this.$el.addClass("has-error");
            return;
        }

        this.$el.removeClass("has-error");

        //if we already have a gene view then delete it
        if ( this.hasOwnProperty('geneView') ) {
            this.geneView.remove();
        }

        this.geneView = new GeneView({gene: text});

        //add our newly rendered element to the parent
        this.geneView.$el.appendTo( this.$el );
    },

    seq_search: function () {
        console.log( $("#seq").val() );
    },
});

var s = new Search();

var listView;
//(function($){

  var GeneView = Backbone.View.extend({
    template: _.template( $("#gene_view").html() ),

    initialize: function(args){
        _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods

        //create spinner
        this.loading();

        this.model = new Gene({marker_symbol: args.gene});
        var self = this;
        this.model.fetch({ 
            success: function () { self.render(); },
            error: function (e) { self.render_error(e) }
        });
    },

    loading: function() {
        this.$el.html( 
            $('<h3 class="text-center"><span class="glyphicon glyphicon-refresh spin"></span></h3>') 
        );
    },

    render: function(){
        //this.$el.append("<ul> <li>hello world</li> </ul>");
        this.$el.html( this.template({attributes: this.model.attributes}) );

        return this;
    },

    render_error: function(e) {
        console.log(e);
        this.$el.html("<h1 class='text-center'>Couldn't find gene</h1>");
    }
  });

  //listView = new ListView();
//})(jQuery);