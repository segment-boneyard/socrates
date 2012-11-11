
var pointersKey = 'socrates.documents';

var pointerKey = function (id, dataKey) {
    return 'socrates.document.' + id + '.' + dataKey;
};

var deleteDocument = function (id) {

    var ids = loadDocumentIds();
    ids = _.without(ids, id);

    localStorage.setItem(pointersKey, ids.join(','));

    var textKey = pointerKey(id, 'text');
    localStorage.removeItem(textKey);

    var updatedKey = pointerKey(id, 'updated');
    localStorage.removeItem(updatedKey);

    var titleKey = pointerKey(id, 'title');
    localStorage.removeItem(titleKey);
};

var loadDocument = function (id) {

    var textKey = pointerKey(id, 'text');
    var textStr = localStorage.getItem(textKey);

    var updatedKey = pointerKey(id, 'updated');
    var updatedStr = localStorage.getItem(updatedKey);

    var titleKey = pointerKey(id, 'title');
    var titleStr = localStorage.getItem(titleKey);

    if (textStr && updatedStr && titleStr) {
        var doc = new Document();

        doc.text = textStr;
        doc.updated = new Date(updatedStr);
        doc.title = titleStr;

        return doc;

    } else {

        return null;
    }
};

var loadDocumentIds = function () {
    var ids = localStorage.getItem(pointersKey);
    if (ids) {
        return ids.split(',');
    } else {
        return [];
    }
};

var loadDocuments = function () {

    var ids = loadDocumentIds();

    var docs = [];

    _.each(ids, function (id) {
        var doc = loadDocument(id);
        if (doc) docs.push(doc);
        else deleteDocument(id);
    });

    return _.sortBy(docs, function (doc) {
        return doc.updated.getTime();
    });
};


var deleteAllDocuments = function () {

    var ids = loadDocumentIds();

    _.each(ids, function (id) {
        deleteDocument(id);
    });
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
    if (h1.length > 0) {
        this.title = h1.value();
    } else {

    }

    this.updated = new Date();

    this._persist();
};

Document.prototype._persist = function () {

    var ids = loadDocumentIds();
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
    deleteDocument(this.id);
};

