const BLOG = {

    oConfig: {
        oMarkdownIt: {
            html: true,        // Enable HTML tags in source
            breaks: true        // Convert '\n' in paragraphs into <br>
        },
        oBlogMardown: {
            title: 'Blog',
            description: 'Liste des articles Ad Vitam Æternam',
            image: 'https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg'
        },
        oHomeMarkdown: {
            title: '',
            description: 'Afin de me libérer de mes maux, il ne me reste qu\'une seule solution : je me dois de les écrire.',
            markdown: 'index.md',
            image: 'https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg'
        },
        sPrefixTitle: 'Ad Vitam Æternam',
        sMarkdownDirectory: 'datas/markdown/'
    },

    oMarkdownIt: null,
    aData: null,
    oMapData: {},
    hMain: null,
    hImage: null,

    initialize: function(){
        this.oMarkdownIt = window.markdownit( this.oConfig.oMarkdownIt );
        this.hMain = document.getElementsByTagName('main')[0];
        this.hImage = document.getElementsByClassName('DS_Image')[0];
        this.parseData();
        this.handleEventListener();
    },

    parseData: function(){
        if( this.aData && Array.isArray(this.aData) ){
            this.aData.forEach( (oData, nIndex) => {
                this.oMapData[ oData.code = oData.markdown.replace('.md', '') ] = nIndex;
            } )
        }
    },

    handleEventListener: function(){
        window.addEventListener('click', (oEvent) => {
            if( oEvent.target && oEvent.target.tagName === 'A' && oEvent.target._target == null ){
                oEvent.preventDefault();
                oEvent.stopPropagation();

                let oQuery = this.extractQueryObject(oEvent.target.search);
                if( oQuery.md == 'blog' ){
                    this.goToBlog();
                } else {
                    this.goTo( oQuery.md );
                }
            }
        }, false);
    },

    extractQueryObject: function(sSearch){
        const oQuery = {},
            aQuery = sSearch.substring(1).split('&');

        aQuery.forEach( (sQuery) => {
            let aData = sQuery.split('=');
            oQuery[aData[0]] = aData[1];
        } );

        return oQuery;
    },

    goToBlog: function(){
        let sHtml = '',
            bFirst = true;

        this.aData.forEach( (oData) => {
            sHtml = this.createHTMLBlog(oData, bFirst) + sHtml;
            bFirst = false;
        } );

        sHtml = '<h1>Liste des articles</h1>' + sHtml;
        this.render( Object.assign( { html: sHtml }, this.oConfig.oBlogMardown) );
    },

    goTo: function(sCode){
        this.loadMarkdown( this.aData[ this.oMapData[sCode] || -1 ] || this.oConfig.oHomeMarkdown ); 
    },

    createHTMLBlog: function(oData, bFirst){
        return `<article>
            <h2>${oData.title}</h2>
            <p>${oData.description}</p>
            <a href="?md=${oData.code}" class="DS_Button --tiercary">Lire d'avantage</a>
        </article>` + ( bFirst ? '' : '<hr/>' );
    },

    loadMarkdown: function(oMarkdown){
        this.ajax(
            this.oConfig.sMarkdownDirectory + oMarkdown.markdown,
            (sResponse) => {
                this.renderMarkdown(oMarkdown, sResponse);
            }
        );
    },

    ajax: function (sUrl, fSuccess) {
        const oXhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        oXhr.open('GET', sUrl);
        oXhr.onreadystatechange = function() {
            if(oXhr.readyState > 3 && oXhr.status == 200){
                fSuccess(oXhr.responseText);
            }
        };
        oXhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        oXhr.send();
        return oXhr;
    },

    renderMarkdown: function(oMarkdown, sResponse){
        this.render( Object.assign( { html: this.oMarkdownIt.render(sResponse) }, oMarkdown) );
    },

    render: function(oData){
        document.title = this.oConfig.sPrefixTitle + ( oData.title ? ' - ' + oData.title : '' );
        document.descripton = oData.descripton;
        this.hImage.style.backgroundImage = "url('" + oData.image + "')";
        this.hMain.innerHTML = oData.html;
    }
};

window.addEventListener('load', () => BLOG.initialize(), false);