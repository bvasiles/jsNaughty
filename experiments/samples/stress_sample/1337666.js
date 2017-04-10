/******************************************************************************
 * ResourceCalculator.js
 *
 * Author:
 * 		Aleksandar Toplek
 *
 * Collaborators:
 * 		Grzegorz Witczak
 *
 * Created on:
 * 		02.07.2012.
 *
 *****************************************************************************/

/// <summary>
/// Informs user how much resources is needed
/// to build or train field, building or unit
/// and how long will it take to collect those
/// resources
/// </summary>
function ResourceCalculator() {

	/// <summary>
	/// Initializes object
	/// </summary>
	this.Register = function(settings) {
		Log("ResourceCalculator: Registering ResourceCalculator plugin...");

		// Retrieve settings
		var colors = {
			ColorZero: RetrieveCustomSettingValue(settings, "ColorZero"),
			ColorLow: RetrieveCustomSettingValue(settings, "ColorLow"),
			ColorMedium: RetrieveCustomSettingValue(settings, "ColorMedium"),
			ColorHigh: RetrieveCustomSettingValue(settings, "ColorHigh")
		};
		var times = {
			LowTime: RetrieveCustomSettingValue(settings, "LowTime"),
			MediumTime: RetrieveCustomSettingValue(settings, "MediumTime")
		};
		console.log(colors);
		BuildCostCalculator(colors, times);
		UnitCostCalculator(colors);
	};

	var BuildCostCalculator = function (colors, times) {
		/// <summary>
		/// Build cost calculator appends empty placeholders
		/// for resources and filled elements for time that
		/// are updated by refresh funuction
		/// </summary>

		Log("ResourceCalculator: Build cost appending...");

		for (var rindex = 0; rindex < 5; rindex++) {
			var resources = ActiveProfile.Villages[ActiveVillageIndex].Resources;
			var inWarehouse = resources.Stored[rindex];
			var production = resources.Production[rindex];
			var storage = resources.Storage[rindex];

			$(".contractCosts, .information, .regenerateCosts").each(function (cindex) {
				$(".showCosts span:eq(" + rindex + ")", this).each(function () {
					// Insert empty divs to get right layout
					if (rindex > 3) {
						$(this).append($("<div>").append("empty").css("visibility", "hidden"));
						$(this).append($("<div>").append("empty").css("visibility", "hidden"));
						return true;
					}

					// Get cost difference
					var res = parseInt($(this).text(), 10) || 0;
					var diff = inWarehouse - res;
					var color = diff < 0 ? colors.ColorHigh : colors.ColorZero;

					// Crete element
					var costElement = $("<div>");
					costElement.addClass("ResourceCalculatorBuildCost");
					costElement.css({
						"color": color,
						"text-align": "right"
					});
					if (storage < res) costElement.addClass("upgradeStorage");
					if (diff < 0) costElement.addClass("negative");
					costElement.html("(" + NumberWithCommas(diff) + ")");
					$(this).append(costElement);

					DLog("ResourceCalculator - Appended cost element for resource [r" + (rindex + 1) + "] difference [" + diff + "]");

					// Get time difference
					if (production < 0 || storage < res) {
						var timeDifference = "never";
					}
					else {
						var ratio = 0;
						if (diff < 0) {
							ratio = (-diff) / production;
						}
						var timeDifference = ConvertSecondsToTime(ratio * 3600);
					}

					// Create elements
					var timeElement = $("<div>");
					timeElement.addClass("ResourceCalculatorBuildFillTime");
					timeElement.attr("data-timeleft", ratio * 3600);
					timeElement.css("text-align", "right");
					timeElement.append("00:00:00");
					$(this).append(timeElement);

					DLog("Appended time deference element for resource [r" + (rindex + 1) + "] difference [" + timeDifference + "]", "ResourceCalculator");
				});
			});
		}

		// Initial refresh
		RefreshBuildFunction(colors, times);

		// Set interval only once for each contract
		setInterval(RefreshBuildFunction, 1000, colors, times);
	};

	/// <summary>
	/// Called in intervals to refresh times on elements and
	/// resource difference
	/// </summary>
	/// <param name="data">Data object</param>
	var RefreshBuildFunction = function (colors, times) {
		// Go through all timeleft indicators
		$(".ResourceCalculatorBuildFillTime").each(function () {
			var secondsLeft = parseInt($(this).attr("data-timeleft"), 10);
			if (secondsLeft >= 0) {
				if (secondsLeft > 0) {
					secondsLeft--;
					$(this).attr("data-timeLeft", secondsLeft);
					$(this).html(ConvertSecondsToTime(secondsLeft));
				}
				else $(this).css("opacity", "0.3");
			}
			else {
				$(this).html("never");
			}

			if (secondsLeft == 0)
				$(this).css("color", colors.ColorZero);
			else if (secondsLeft < times.LowTime)
				$(this).css("color", colors.ColorLow);
			else if (secondsLeft < times.MediumTime)
				$(this).css("color", colors.ColorMedium);
			else $(this).css("color", colors.ColorHigh);
		});
	};

	var UnitCostCalculator = function (colors) {
		/// <summary>
		/// Units cost calculator appends empty placeholders
		/// </summary>

		DLog("ResourceCalculator: Unit cost appending...");

		var inputs = $(".details > input[name*='t']");
		var costs = $(".details > .showCosts");

		$.each(costs, function (iindex) {
			// Append resource cost change element
			for (var rindex = 0; rindex < 5; rindex++) {
				// Layout fix for crop cost
				if (rindex > 3) {
					$("span:eq(" + rindex + ")", costs[iindex]).append($("<div>").append("empty").hide());
					continue;
				}

				// Create element to show resource difference
				var costElement = $("<div>");
				costElement.addClass("ResourceCalculatorBuildCost");
				costElement.addClass("ResourceCalculatorR" + rindex);
				costElement.css("color", colors.ColorZero);
				costElement.css("text-align", "right");
				costElement.html("(0)");
				$("span:eq(" + rindex + ")", costs[iindex]).append(costElement);
			}

			// Attach function on textbox change
			$(inputs[iindex]).on("input", function () {
				RefreshUnitsFunction($(inputs[iindex]), $(costs[iindex]), colors);
			});

			// Initial call
			RefreshUnitsFunction($(inputs[iindex]), $(costs[iindex]), colors);
		});
	};

	var RefreshUnitsFunction = function (input, cost, colors) {
		/// <summary>
		/// Refreshes units cost elements
		/// </summary>
		/// <param name="input">Input element to refresh from (used for quantity)</param>
		/// <param name="cost">Cost element to update</param>

		// Get quantity requested
		var quantity = parseInt(input.val(), 10) || 1;

		for (var rindex = 0; rindex < 4; rindex++) {
			var inWarehouse = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[rindex];

			// Get resource cost of one unit
			var resourceCost = parseInt($("span:eq(" + rindex + ")", cost).text(), 10) || 0;

			// Calculate difference
			var diff = inWarehouse - resourceCost * quantity;
			var color = diff < 0 ? colors.ColorHigh : colors.ColorZero;

			// Update elements
			var costElement = $(".ResourceCalculatorR" + rindex, cost);
			costElement.html("(" + NumberWithCommas(diff) + ")");
			costElement.css("color", color);
			if (diff < 0) {
				costElement.addClass("negative");
			} else {
				costElement.removeClass("negative");
			}
		}
	};
};

// Metadata for this plugin (ResourceCalculator)
var ResourceCalculatorMetadata = {
	Name: "ResourceCalculator",
	Alias: "Resource Calculator",
	Category: "Economy",
	Version: "0.2.5.0",
	Description: "Shows you how much of each resource is needed to build field, building or train army. ",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Settings: {
		RunOnPages: [Enums.TravianPages.Build],
		IsLoginRequired: true
	},


	CustomSettings: [
		{
			Name: "LowTime",
			Header: "Low limit (seconds)",
			DataType: Enums.DataTypes.Number,
			DefaultValue: 2700
		},
		{
			Name: "MediumTime",
			Header: "Medium limit (seconds)",
			DataType: Enums.DataTypes.Number,
			DefaultValue: 10800
		},
		{
			Name: "ColorZero",
			Header: "Zero difference resource color",
			DataType: Enums.DataTypes.Color,
			DefaultValue: "#0C9E21"
		},
		{
			Name: "ColorLow",
			Header: "Low difference resource color",
			DataType: Enums.DataTypes.Color,
			DefaultValue: "#AEBF61"
		},
		{
			Name: "ColorMedium",
			Header: "Medium difference resource color",
			DataType: Enums.DataTypes.Color,
			DefaultValue: "#A6781C"
		},
		{
			Name: "ColorHigh",
			Header: "Hight difference resource color",
			DataType: Enums.DataTypes.Color,
			DefaultValue: "#B20C08"
		}
	],

	Flags: {
		Beta: true
	},

	Class: ResourceCalculator
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, ResourceCalculatorMetadata);
