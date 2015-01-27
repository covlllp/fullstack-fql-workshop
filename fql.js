// Place your code here:

// Adds properties of obj2 into obj1
function merge(obj1, obj2) {
  var obj = clone(obj1);

  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj[key] = obj2[key];
    }
  }
  return obj;
};

function clone (obj) {
  var new_obj = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      new_obj[key] = obj[key];
    }
  }
  return new_obj;
}


var FQL = function(table) {
    this.data = table;
    this.indexedData = [];
    this.indexedCol = '';
};

FQL.prototype.exec = function () {
  return this.data;
};

FQL.prototype.count = function () {
  return this.data.length;
};

FQL.prototype.limit = function (amount) {
  // this.data.splice(amount, this.data.length - amount);
  return new FQL(this.data.slice(0,amount));
};

FQL.prototype.where = function (filters) {
  var rtn_arr = this.data.filter(function(movie) {
    var keys = Object.keys(filters);
    return keys.every(function(key) {
      if (typeof filters[key] == 'function') {
        return filters[key](movie[key]);
      } else {
        return movie[key] == filters[key];
      }
    });
  });
  return new FQL(rtn_arr);
};

FQL.prototype.select = function (keysToKeep) {
  var rtn_arr = this.data.map(function(movie) {
    var new_obj = {};
    keysToKeep.forEach(function(key) {
      new_obj[key] = movie[key];
    });
    return new_obj;
  });

  return new FQL(rtn_arr);
};

FQL.prototype.order = function (key) {
  var rtn_arr = this.data.sort(function(a, b){
      return a[key] * 1 - b[key] * 1;
  });

  return new FQL(rtn_arr);
};

FQL.prototype.left_join = function (foriegnFql, rowMatcher) {
  var self = this;
  var rtn_arr = foriegnFql.data.filter(function(foriegn_obj) {
    return self.data.some(function(obj) {
      return rowMatcher(obj, foriegn_obj);
    });
  }).map(function(foriegn_obj) {
    var new_obj;
    self.data.forEach(function(obj) {
      if (rowMatcher(obj, foriegn_obj)) {
        new_obj = merge(foriegn_obj, obj);
      };
    });
    return new_obj;
  });

  return new FQL(rtn_arr);
};

FQL.prototype.addIndex = function (key) {
  this.indexedCol = key;
  this.indexedData = [];
  var self = this;
  this.data.forEach(function(obj) {
    self.indexedData.push(obj[key]);
  });
};

FQL.prototype.getIndicesOf = function (columnName, val) {
  if (this.indexedCol == columnName) {
    var rtn_arr = [];
    var ind = this.indexedData.indexOf(val);
    while (ind != -1) {
      rtn_arr.push(ind);
      ind = this.indexedData.indexOf(val, ind + 1);
    }
    return rtn_arr;
  }
};