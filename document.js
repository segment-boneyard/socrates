
var pointersKey = 'socrates.documents';

var pointerKey = function (id, dataKey) {
    return 'socrates.document.' + id + '.' + dataKey;
};

var loadDocument = function (id) {

    var textKey = pointerKey(id, 'text');
    var textStr = localStorage.getItem(textKey);

    var updatedKey = pointerKey(id, 'updated');
    var updatedStr = localStorage.getItem(updatedKey);

    var titleKey = pointerKey(id, 'title');
    var titleStr = localStorage.getItem(titleKey);

    if (textStr) {
        var doc = new Document();
        doc.text = textStr;
        if (updatedStr) doc.updated = new Date(updatedStr);
        if (titleStr) doc.title = titleStr;

        return doc;

    } else {

        return null;
    }
};

var getDocumentIds = function () {
    var ids = localStorage.getItem(pointersKey);
    if (ids) {
        return ids.split(',');
    } else {
        return [];
    }
};

var getDocuments = function () {

    var ids = getDocumentIds();

    var docs = [];

    _.each(ids, function (id) {
        var doc = loadDocument(id);
        if (doc) docs.push(doc);
    });

    return docs;
};


var Document = function () {
    this.id = guid();
    this.updated = new Date();
    this.title = 'Untitled';
};

Document.prototype.save = function (text, markdown) {

    if (!text) text = '';
    if (!markdown) markdown = '';

    this.text = text;

    var h1 = $(markdown).find('h1');
    if (h1.length > 0) this.title = h1.value();

    this.updated = new Date();

    this._persist();
};

Document.prototype._persist = function () {

    var ids = getDocumentIds();
    ids.push(this.id);
    ids = _.uniq(ids);

    localStorage.setItem(pointersKey, ids.join(','));

    var textKey = pointerKey(this.id, 'text');
    localStorage.setItem(textKey, this.text);

    var updatedKey = pointerKey(this.id, 'updated');
    localStorage.setItem(updatedKey, this.updated.toISOString());

    var titleKey = pointerKey(this.id, 'title');
    localStorage.setItem(titleKey, this.title);
};

Document.prototype.remove = function () {

    var ids = getDocumentIds();
    ids = _.without(ids, this.id);

    localStorage.setItem(pointersKey, ids.join(','));

    var textKey = pointerKey(this.id, 'text');
    localStorage.removeItem(textKey);

    var updatedKey = pointerKey(this.id, 'updated');
    localStorage.removeItem(updatedKey);

    var titleKey = pointerKey(this.id, 'title');
    localStorage.removeItem(titleKey);
};

