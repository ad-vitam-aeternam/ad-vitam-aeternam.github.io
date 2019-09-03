const APP = {

    oConfig: {
        oMarkdownIt: {
            html: true,        // Enable HTML tags in source
            breaks: true        // Convert '\n' in paragraphs into <br>
        },
        sPrefixTitle: 'Ad Vitam Æternam',
        sMarkdownDirectory: 'datas/markdown/'
    },

    oMarkdownIt: null,
    aData: null,
    oMapData: {},

    hMain: null,
    hImage: null,
    hLine: null,
    hContent: null,

    initialize: function(){
        this.oMarkdownIt = window.markdownit( this.oConfig.oMarkdownIt );
        this.getHTMLElement();
        this.parseData();
        this.handleEventListener();
        if( location.search ){
            this.goTo( location.search );
        } else {
            this.createList();
        }
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
            if( hTarget && hTarget.tagName === 'A' && hTarget._target == null && !hTarget.classList.contains('--inactive') && hTarget.search ){
                oEvent.preventDefault();
                oEvent.stopPropagation();
                this.goTo( hTarget.search );
            }
        }, false);

        window.addEventListener('popstate', (oEvent) => {
            if( location.search ){
                this.goTo( location.search );
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

    createList: function(){
        let sHtml = '';
        this.aData.forEach( (oData) => {
            sHtml += this.createHTMLList(oData);
        } );
        this.hMain.innerHTML += sHtml;
    },

    goTo: function(sSearch){
        const oQuery = this.extractQueryObject(sSearch),
            nIndex = this.oMapData[oQuery.md];

        if( nIndex != null ){
            this.loadMarkdown( this.aData[nIndex] ); 
        }
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
        const oNow = new Date(),
            sVersion = oNow.getDate() + ( oNow.getMonth() + 1 ) + oNow.getFullYear() + '_' + oNow.getHours() + oNow.getMinutes();

        this.ajax(
            this.oConfig.sMarkdownDirectory + oMarkdown.markdown + '?v=' + sVersion,
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
        history.pushState({}, document.title, location.origin + ( oData.code ? '?md=' + oData.code : '' ));

        this.hImage.style.backgroundImage = "url('" + oData.image + "')";
        this.hMain.innerHTML = oData.html;
        this.hLine.innerHTML = oData.title || this.oConfig.sPrefixTitle;
        this.hContent.scrollTop = 0;
    }
};

window.addEventListener('DOMContentLoaded', () => APP.initialize(), false);