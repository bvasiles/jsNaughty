library(sqldf)

source("~/jsnaughty/evaluation/jsniceCompareHelper.r", encoding = 'UTF-8')

compare_var <- read.csv("~/jsnaughty/evaluation/compare_var.csv", sep=";")
View(compare_var)

#Get the ones that were actually renamed
renamed <- compare_var[compare_var$was_obs=='True',]
#Get the exact equality metrics.
renamed$exact_match <- as.character(renamed$choosen_renaming) == as.character(renamed$orig_name)

#Want to compare freqlen, lm, log_model from renaming hash_def_one against js_nice
h_freq <- renamed[renamed$renaming_strat == "hash_def_one_renaming" & renamed$consistency_strat == "freqlen",]
h_lm <- renamed[renamed$renaming_strat == "hash_def_one_renaming" & renamed$consistency_strat == "lm",]
h_model <- renamed[renamed$renaming_strat == "hash_def_one_renaming" & renamed$consistency_strat == "logmodel",]
jsnice <- renamed[renamed$renaming_strat == "n2p",]

#Variable-instances? (Effect size is odds ratio...)
comparisonTable(h_freq, jsnice)
comparisonTable(h_lm, jsnice)
comparisonTable(h_model, jsnice)


