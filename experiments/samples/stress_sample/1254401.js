/**
 * Array and Object helper.
 *
 * @package    Johana
 * @category   Helpers
 * @author     Johana Team
 * @copyright  (c) 2011 Johana Team
 * @license    http://johanaframework.org/license
 */
JohanaArr = function()
{
};

/**
 * @var  String  default delimiter for path()
 */
JohanaArr.delimiter = '.';

/**
 * Gets a value from an object using a dot separated path.
 *
 *     // Get the value of obj.foo.bar
 *     var value = Arr.path(obj, 'foo.bar');
 *
 * Using a wildcard "*" will search intermediate objects and return an object.
 *
 *     // Get the values of "color" in theme
 *     var colors = Arr.path(obj, 'theme.*.color');
 *
 *     // Using an array of keys
 *     var colors = Arr.path(array, ['theme', '*', 'color']);
 *
 * @param   Object  object to search
 * @param   mixed   key path string (delimiter separated) or array of keys
 * @param   mixed   default value if the path is not set
 * @param   String  key path delimiter
 * @return  mixed
 */
JohanaArr.path = function(obj, path, def, delimiter)
{
	def = def || null; delimiter = delimiter || null;

	if (typeof obj != 'object')
	{
		// This is not an array!
		return def;
	}

	if (typeof path == 'object' && path.length)
	{
		// The path has already been separated into keys
		var keys = path;
	}
	else
	{
		if (obj[path] !== undefined)
		{
			// No need to do extra processing
			return obj[path];
		}

		if (delimiter === null)
		{
			// Use the default delimiter
			delimiter = Arr.delimiter;
		}

		// Quote delimiter to RegExp
		var quoted = delimiter.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");

		// Remove starting delimiters and spaces
		path = path.replace(new RegExp('^[\\s' + quoted + ']+'), '');

		// Remove ending delimiters, spaces, and wildcards
		path = path.replace(new RegExp('[\\s\\*' +quoted + ']+$'), '');

		var keys = path.split(delimiter);
	}

	while (keys)
	{
		var key = keys.shift();

		if (obj[key] != undefined)
		{
			if (keys.length)
			{
				if (typeof obj[key] == 'object')
				{
					// Dig down into the next part of the path
					obj = obj[key];
				}
				else
				{
					// Unable to dig deeper
					break;
				}
			}
			else
			{
				// Found the path requested
				return obj[key];
			}
		}
		else if (key === '*')
		{
			// Handle wildcards
			var values = [];

			for (var v in obj)
			{
				var value = Arr.path(obj[v], keys.join('.'));

				if (value)
				{
					values.push(value);
				}
			}

			if (values.length)
			{
				// Found the values requested
				return values;
			}
			else
			{
				// Unable to dig deeper
				break;
			}
		}
		else
		{
			// Unable to dig deeper
			break;
		}
	}

	// Unable to find the value requested
	return def;
};

/**
 * Merges 2 objects
 *
 * @param   Object  initial object
 * @param   Object  object to merge
 * @return  Object
 */
JohanaArr.merge = function(destination, source)
{
	for (var property in source)
	{
		if (source.hasOwnProperty(property))
		{
			destination[property] = source[property];
		}
	}

	return destination;
};

/**
 * Retrieve a single key from an object. If the key does not exist in the
 * object, the default value will be returned instead.
 *
 *     // Get the value "username" from POST, if it exists
 *     var username = Arr.get(POST, 'username');
 *
 *     // Get the value "sorting" from GET, if it exists
 *     var sorting = Arr.get(GET, 'sorting');
 *
 * @param   Object  object to extract from
 * @param   String  key name
 * @param   Mixed   default value
 * @return  Mixed
 */
JohanaArr.get = function(obj, key, def)
{
	def = def || null;

	return (obj[key] === undefined) ? def : obj[key];
};

/**
 * Check if object is empty
 *
 * @param   Object  object to check
 * @return  Boolean
 */
JohanaArr.isEmpty = function(source)
{
    for (var prop in source)
    {
        if (source.hasOwnProperty(prop)) return false;
    }

    return true;
};

module.exports = JohanaArr; // End