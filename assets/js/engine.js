const APP = {

    oConfig: {
        oMarkdownIt: {
            html: true,        // Enable HTML tags in source
            breaks: true        // Convert '\n' in paragraphs into <br>
        },
        oListMardown: {
            title: 'Maux',
            description: 'Liste des Maux Ad Vitam Æternam',
            image: 'https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&cs=tinysrgb&dpr=3',
            code: 'list'
        },
        oHomeMarkdown: {
            title: '',
            description: 'Afin de me libérer de mes maux, il ne me reste qu\'une seule solution : je me dois de les écrire.',
            markdown: 'index.md',
            image: 'https://images.pexels.com/photos/931007/pexels-photo-931007.jpeg?auto=compress&cs=tinysrgb&dpr=3'
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
    hcNav: [],

    initialize: function(){
        this.oMarkdownIt = window.markdownit( this.oConfig.oMarkdownIt );
        this.getHTMLElement();
        this.parseData();
        this.handleEventListener();
        location.search && this.redirect(location.search);
    },

    getHTMLElement: function(){
        this.hMain = document.getElementsByTagName('main')[0];
        this.hImage = document.getElementsByClassName('DS_Image')[0];
        this.hLine = document.getElementsByClassName('DS_Footer__Text')[0];
        this.hcNav = document.getElementsByClassName('DS_Nav__ItemLink');
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
            location.search && this.redirect( location.search );
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

    redirect: function(sSearch){
        let oQuery = this.extractQueryObject(sSearch);
        if( oQuery.md == 'list' ){
            this.goToList();
        } else {
            this.goTo( oQuery.md );
        }
    },

    goToList: function(){
        let sHtml = '';
        this.aData.forEach( (oData) => {
            sHtml = this.createHTMLList(oData) + sHtml;
        } );
        sHtml = '<h1>Maux</h1>' + sHtml;
        this.render( Object.assign( { html: sHtml }, this.oConfig.oListMardown) );
        this.activeNav(1);
    },

    goTo: function(sCode){
        const nIndex = this.oMapData[sCode],
            oMarkdown = this.aData[ nIndex == null ? -1 : nIndex ] || this.oConfig.oHomeMarkdown;
        this.loadMarkdown(oMarkdown); 
        this.activeNav( oMarkdown.title ? 1 : 0);
    },

    activeNav: function(nNav){
        [].forEach.call(this.hcNav, (hNav, nIndex) => {
            hNav.classList[ nNav == nIndex ? 'add' : 'remove' ]('--active');
        } );
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
            this.oConfig.sMarkdownDirectory + oMarkdown.markdown + '?v=010819_1200',
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
    }
};

window.addEventListener('DOMContentLoaded', () => APP.initialize(), false);