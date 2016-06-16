var ValueTypeHelper =
{
    cleanDuplicatesFromArray: function(array)
    {
        var cleansedArray = [];

        for(var i = 0; i < array.length; i++)
        {
            if(!this.arrayContains(cleansedArray, array[i]))
            {
                cleansedArray.push(array[i]);
            }
        }

        return cleansedArray;
    },

    removeFromArrayByIndex:function(array, index)
    {
        try
        {
            if(index < 0 || index >= array.length) { debugger; alert("Index out of range when removing array in ValueTypeHelper"); return; }

            return array.splice(index, 1);
        }
        catch(e) { alert("Error while removing elements from array by index: " + e);}
    },

    arrayContains: function(array, item)
    {
        for(var i = 0; i < array.length; i++)
        {
            if(array[i] === item) { return true; }
        }

        return false;
    },

    isString: function (variable)
    {
        if (this.isNull(variable)) { return false; }

        return (typeof variable) == "string" || variable instanceof String;
    },

    isNull: function (variable)
    {
        return variable === null;
    },

    isNumber: function(variable)
    {
        if (this.isNull(variable)) { return false; }

        return (typeof variable) == "number";
    },

    pushAll: function(baseArray, arrayWithItems)
    {
        try
        {
            baseArray.push.apply(baseArray, arrayWithItems);
        }
        catch(e) { alert("Error while pushing all in ValueTypeHelper:" + e); }
    },

    getHighestIndexProperty: function(object)
    {
        if(object == null) { return null; }

        var highestIndex = Number.NEGATIVE_INFINITY;

        for(var prop in object)
        {
            if(this.isStringInteger(prop) || this.isInteger(prop))
            {
                var number = prop * 1;

                if(number > highestIndex)
                {
                    highestIndex = number;
                }
            }
        }

        if(highestIndex == Number.NEGATIVE_INFINITY) { return null; }

        return highestIndex;
    },

    isStringInteger: function(variable)
    {
        if (this.isNull(variable)) { return false; }

        return variable == parseInt(variable,10);
    },

    isInteger: function (variable)
    {
        if (this.isNull(variable)) { return false; }

        return (typeof variable) == "number" && variable == parseInt(variable,10);
    },

    getArraysIntersection: function(firstArray, secondArray)
    {
        if(firstArray == null || secondArray == null || firstArray.length == 0 || secondArray.length == 0) { return []; }

        var intersection = [];

        for(var i = 0; i < firstArray.length; i++)
        {
            for(var j = 0; j < secondArray.length; j++)
            {
                if(firstArray[i] == secondArray[j])
                {
                    intersection.push(firstArray[i]);
                }
            }
        }

        return intersection;
    },

    isEmptyObject: function(object)
    {
        if(object == null) { return false; }

        for(var prop in object)
        {
            if(object.hasOwnProperty(prop)) { return false; }
        }

        return true;
    },
};

exports.ValueTypeHelper = ValueTypeHelper;
