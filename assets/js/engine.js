const APP = {

    oConfig: {
        oMarkdownIt: {
            html: true,        // Enable HTML tags in source
            breaks: true        // Convert '\n' in paragraphs into <br>
        },
        oListMardown: {
            title: '',
            description: 'Les années passent, mais les problèmes restent les mêmes : manque de confiance, lassitude, solitude, frustration, colère...',
            image: 'https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&cs=tinysrgb&dpr=3'
        },
        sPrefixTitle: 'Ad Vitam Æternam',
        sMarkdownDirectory: 'datas/markdown/'
    },

    oMarkdownIt: null,
    aData: null,
    oMapData: {},
    bFirstRender: true,

    hMain: null,
    hImage: null,
    hLine: null,
    hContent: null,

    initialize: function(){
        this.oMarkdownIt = window.markdownit( this.oConfig.oMarkdownIt );
        this.getHTMLElement();
        this.parseData();
        this.handleEventListener();
        this.redirect(location.search);
    },

    getHTMLElement: function(){
        this.hMain = document.getElementsByTagName('main')[0];
        this.hImage = document.getElementsByClassName('DS_Image')[0];
        this.hLine = document.getElementsByClassName('DS_Footer__Text')[0];
        this.hContent = document.getElementsByClassName('DS_Content__Scroll')[0];
    },

    parseData: function(){
        if( this.aData && Array.isArray(this.aData) ){
            this.aData.forEach( (oData, nIndex) => {
                this.oMapData[ oData.code = oData.markdown.replace('.md', '') ] = nIndex;
            } );
        }
    },

    handleEventListener: function(){
        window.addEventListener('click', (oEvent) => {
            const hTarget = oEvent.target
            if( hTarget && hTarget.tagName === 'A' && hTarget._target == null && !hTarget.classList.contains('--inactive') ){
                oEvent.preventDefault();
                oEvent.stopPropagation();
                this.redirect( hTarget.search );
            }
        }, false);

        window.addEventListener('popstate', (oEvent) => {
            if( location.search ){
                this.redirect( location.search );
            } else {
                location.reload();
            }
        }, false);
    },

    extractQueryObject: function(sSearch){
        const oQuery = {};
        if( sSearch ){
            sSearch.substring(1).split('&').forEach( (sQuery) => {
                let aData = sQuery.split('=');
                oQuery[aData[0]] = aData[1];
            } );
        }
        return oQuery;
    },

    redirect: function(sSearch){
        let oQuery = this.extractQueryObject(sSearch);
        if( oQuery.md ){
            this.goTo( oQuery.md );
        } else {
            this.createList();
        }
    },

    createList: function(){
        let sHtml = '';
        this.aData.forEach( (oData) => {
            sHtml += this.createHTMLList(oData);
        } );
        this.render( Object.assign( { html: sHtml }, this.oConfig.oListMardown), true );
    },

    goTo: function(sCode){
        const nIndex = this.oMapData[sCode],
            oMarkdown = this.aData[ nIndex == null ? -1 : nIndex ] || this.oConfig.oHomeMarkdown;
        this.loadMarkdown(oMarkdown); 
    },

    createHTMLList: function(oData){
        return `<article class="DS_Article">
            <h2>${oData.title}</a></h2>
            <p>
                ${oData.description}<br/>
                <a href="?md=${oData.code}">Lire d'avantage</a>
            </p>
        </article>`;
    },

    loadMarkdown: function(oMarkdown){
        this.ajax(
            this.oConfig.sMarkdownDirectory + oMarkdown.markdown + '?v=030919_1015',
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

    render: function(oData, bAppend){
        document.title = this.oConfig.sPrefixTitle + ( oData.title ? ' - ' + oData.title : '' );
        document.descripton = oData.descripton;
        if( this.bFirstRender ){
            this.bFirstRender = false;
        } else {
            history.pushState({}, document.title, location.origin + ( oData.code ? '?md=' + oData.code : '' ));
        }

        this.hImage.style.backgroundImage = "url('" + oData.image + "')";
        if( bAppend ){
            this.hMain.innerHTML += oData.html;
        } else {
            this.hMain.innerHTML = oData.html;
        }
        this.hLine.innerHTML = oData.title || this.oConfig.sPrefixTitle;
        this.hContent.scrollTop = 0;
    }
};

window.addEventListener('DOMContentLoaded', () => APP.initialize(), false);