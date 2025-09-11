'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
/* Returns mongoose errors */
exports.getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				//message = getUniqueErrorMessage(err);
			    message = "Item with the same name/key already exists";
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/* TODO: Update to return correct non mnogoose errors */
exports.returnGenericError = function (message) {
    /* Return messasge for now, later implement error codes */
    return message;
};