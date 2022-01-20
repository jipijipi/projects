/**
 * Created by LittleLama on 30/01/2018.
 */
function checkNested(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
        }
        obj = obj[args[i]];
    }
    return true;
}
/*Returns true if it is a DOM node*/
function isDOMNode(o){
    return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
}

/*Returns true if it is a DOM element*/
function isDOMElement(o){
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : /*DOM2*/
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
}

/*Convert string to DOM Element*/
function createElementFromHTML(htmlString) {
    if(!isNaN(htmlString)) htmlString = htmlString.toString();
    if(typeof htmlString != "undefined") {
        var div = document.createElement("div");
        div.innerHTML = htmlString.trim();
        /*Change this to div.childNodes to support multiple top-level nodes*/
        return div.firstChild;
    }
}

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}
function roughSizeOfObject( object ) {
    var objectList = [];
    var recurse = function( value )    {
        var bytes = 0;
        if ( typeof value === 'boolean' ) {
            bytes = 4;
        }
        else if ( typeof value === 'string' ) {
            bytes = value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes = 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList[ objectList.length ] = value;

            for( i in value ) {
                bytes+= 8; // an assumed existence overhead
                bytes+= recurse( value[i] )
            }
        }
        return bytes;
    }
    return recurse( object );
}
function isCyclic (obj) {
    var seenObjects = [];

    function detect (obj) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1) {
                return true;
            }
            seenObjects.push(obj);
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && detect(obj[key])) {
                    console.log(obj, 'cycle at ' + key);
                    return true;
                }
            }
        }
        return false;
    }

    return detect(obj);
}
String.prototype.clean = function(){
    // Initialisation
    var hash = {
        'À' : 'A', 'Á' : 'A', 'Â' : 'A', 'Ã' : 'A', 'Ä' : 'A', 'Å' : 'A', 'Æ' : 'AE', 'Ă' : 'A', 'Ā' : 'A',
        'à' : 'a', 'á' : 'a', 'â' : 'a', 'ã' : 'a', 'ä' : 'a', 'å' : 'a', 'æ' : 'ae', 'ă' : 'a', 'ā' : 'a', 'ª' : 'a',
        'þ' : 'b', 'Þ' : 'B',
        'Ç' : 'C', 'Ć' : 'C', 'Ĉ' : 'C', 'Ċ' : 'C', 'Č' : 'c','ç' : 'c', 'ć' : 'c', 'ĉ' : 'c', 'ċ' : 'c', 'č' : 'c',
        'Ď' : 'D', 'ď' : 'd', 'Đ' : 'D', 'đ' : 'd', 'Ð' : 'D',
        'È' : 'E', 'É' : 'E', 'Ê' : 'E', 'Ë' : 'E', 'Ē' : 'E', 'Ĕ' : 'E', 'Ė' : 'E', 'Ę' : 'E', 'Ě' : 'E', '€' : 'E',
        'è' : 'e', 'é' : 'e', 'ê' : 'e', 'ë' : 'e', 'ē' : 'e', 'ĕ' : 'e', 'ė' : 'e', 'ę' : 'e', 'ě' : 'e',
        'Ğ' : 'G', 'ğ' : 'g', 'Ĝ' : 'G', 'ĝ' : 'g', 'Ġ' : 'G', 'ġ' : 'g', 'Ģ' : 'G', 'ģ' : 'g',
        'Ĥ' : 'H', 'ĥ' : 'h', 'Ħ' : 'H', 'ħ' : 'h',
        'Ì' : 'I', 'Í' : 'I', 'Î' : 'I', 'Ï' : 'I', 'İ' : 'I', 'Ĩ' : 'I', 'Ī' : 'I', 'Ĭ' : 'I', 'Į' : 'I', 'Ĳ' : 'IJ', 'Ĵ' : 'J',
        'ì' : 'i', 'í' : 'i', 'î' : 'i', 'ï' : 'i', 'ı' : 'i', 'ĩ' : 'i', 'ī' : 'i', 'ĭ' : 'i', 'į' : 'i', 'ĳ' : 'ij', 'ĵ' : 'j',
        'Ķ' : 'K', 'ķ' : 'k', 'ĸ' : 'k',
        'Ĺ' : 'L', 'ĺ' : 'l', 'Ļ' : 'L', 'ļ' : 'L', 'Ľ' : "L\'", 'ľ' : "l\'", 'Ŀ' : 'L', 'ŀ' : 'l', 'Ł' : 'L', 'ł' : 'l',
        'Ñ' : 'N', 'ñ' : 'n', 'Ń' : 'N', 'ń' : 'n', 'Ņ' : 'N', 'ņ' : 'n', 'Ň' : 'N', 'ň' : 'n', 'ŉ' : 'n', 'Ŋ' : 'N', 'ŋ' : 'n',
        'Ò' : 'O', 'Ó' : 'O', 'Ô' : 'O', 'Õ' : 'O', 'Ö' : 'O', 'Ø' : 'O', 'Ō' : 'O', 'Ŏ' : 'O', 'Ő' : 'O', 'Œ' : 'OE',
        'ò' : 'o', 'ó' : 'o', 'ô' : 'o', 'õ' : 'o', 'ö' : 'o', 'ø' : 'o', 'ō' : 'o', 'ŏ' : 'o', 'ő' : 'o', 'œ' : 'oe', 'ð' : 'o',
        'Ŕ' : 'R', 'ŕ' : 'r', 'Ŗ' : 'R', 'ŗ' : 'r', 'Ř' : 'R', 'ř' : 'r',
        'ß' : 'Ss','Ş' : 'S', 'Ș' : 'S', 'Š' : 'S', 'Ś' : 'S', 'Ŝ' : 'S',
        'ş' : 's', 'ș' : 's', 'š' : 's', 'ś' : 's', 'ŝ' : 's',
        'ț' : 't', 'Ț' : 'T', 'Ţ' : 'T', 'ţ' : 't', 'Ť' : 'T', 'ť' : 't', 'Ŧ' : 'T', 'ŧ' : 't',
        'Ù' : 'U', 'Ú' : 'U', 'Û' : 'U', 'Ü' : 'U', 'Ũ' : 'U', 'Ū' : 'U', 'Ŭ' : 'U', 'Ů' : 'U', 'Ű' : 'U', 'Ų' : 'U',
        'ù' : 'u', 'ú' : 'u', 'û' : 'u', 'ü' : 'u', 'ū' : 'u', 'ũ' : 'u', 'ŭ' : 'u', 'ů' : 'u', 'ű' : 'u', 'ų' : 'u',
        'Ŵ' : 'W', 'ŵ' : 'w', 'Ý' : 'Y', 'Ÿ' : 'y', 'Ŷ' : 'Y', 'ý' : 'y', 'ÿ' : 'y', 'ŷ' : 'y',
        'Ž' : 'Z', 'Ź' : 'Z', 'Ż' : 'Z', 'ž' : 'z', 'ź' : 'z', 'ż' : 'z',
        '©' : 'c', '®' : 'r', '§' : 'S', '@' : 'A', '¥' : 'Y', '¢' : 'c', '£' : 'L', '$' : 'S', '³' : '3', '²' : '2'};
    var keys = Object.getOwnPropertyNames(hash);
    var length = 0;
    var tmp = "";

    // Création de la table d'équivalence...
    for (var i=0; i<this.length; i++) {
        var char = this.charAt(i);
        if(keys.indexOf(char)!==-1) {
            tmp+=hash[char];
        }
        else {
            tmp+=char;
        }
    }
    return tmp;
}
String.prototype.cleanName = function() {
    var str = this.trim();
    str = str.clean();
    str = str.replace("/(?!([A-Za-z0-9_-]+))/","");
    str = str.replace("/\s+/","_");
    return str;
}
String.prototype.cleanSEOName = function(){
    var str = this.trim();
    str = str.clean();
    str = str.replace("/[!A-Za-z0-9_-]+/","");
    str = str.replace("/[\s_]+/","-");
    return str;
}