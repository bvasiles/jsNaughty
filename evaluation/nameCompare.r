library(sqldf)
library(stringr)

compareOrigWithTool <- read.csv("~/jsnaughty/evaluation/compareOrigWithTool.csv", sep=";")
View(compareOrigWithTool)
n2p <- compareOrigWithTool[compareOrigWithTool$renaming_strat=="n2p",]

renamed <- compareOrigWithTool[compareOrigWithTool$was_obs=='True',]

#Add in some new variables (Scope ID is not what I think it is I think -> its a 1-1 mapping with line index once you take into account the file and strategies)
#1. original Names Freq in the results
nfreq = sqldf("SELECT count(orig_name) as nFreq, orig_name FROM renamed GROUP BY orig_name")
renamed = merge(renamed, nfreq, by =c("orig_name"))
#2. Length of orig name in characters
renamed$orig_len <- nchar(as.character(renamed$orig_name))
#3. # Variables w/in a scope
var_in_scope = sqldf("SELECT filename, consistency_strat, renaming_strat, scope_id,count(*) as var_in_scope FROM renamed GROUP BY filename, consistency_strat, renaming_strat, scope_id")
renamed = merge(renamed, var_in_scope, by=c("filename", "consistency_strat", "renaming_strat", "scope_id"))
#4. # Variables w/in a line.
var_in_line = sqldf("SELECT filename, consistency_strat, renaming_strat, line_index,count(*) as var_in_line FROM renamed GROUP BY filename, consistency_strat, renaming_strat,line_index")
renamed = merge(renamed, var_in_line, by=c("filename", "consistency_strat", "renaming_strat", "line_index"))
#5 #Of times this variable is referenced in its scope
this_var_in_scope = sqldf("SELECT filename, consistency_strat, renaming_strat, scope_id, orig_name, count(*) as this_var_in_scope FROM renamed GROUP BY filename, consistency_strat, renaming_strat, scope_id, orig_name")
renamed = merge(renamed, this_var_in_scope, by=c("filename", "consistency_strat", "renaming_strat", "scope_id", "orig_name"))
#6 Scope depth? (Number of "["?
renamed$scope_depth <- str_count(as.character(renamed$scope_id), "\\[")
#7 Suggestion list size?
renamed$slist_size <- str_count(as.character(renamed$suggestion_list, ","))

renamed$exact_match <- as.character(renamed$orig_name)==as.character(renamed$choosen_renaming)
renamed$approx_suggest <- renamed$abbrev_suggest=="True" | renamed$lc_suggest=="True" | renamed$nspec_suggest=="True" | renamed$contain_suggest=="True"
hist(log(renamed$nFreq + .5))
hist(log(renamed$orig_len + .5))
hist(log(renamed$var_in_scope + .5)) # Still not really normal
hist(log(renamed$var_in_line + .5))
hist(log(renamed$scope_depth + .5))
hist(log(renamed$slist_size + .5))

#The lm strat does nothing...
m1 <- lm(exact_match ~ log(nFreq + .5)+ log(orig_len + .5) + log(var_in_scope + .5) + log(var_in_line+.5) + log(scope_depth +.5) + log(slist_size + .5) + renaming_strat + consistency_strat, data = renamed)

m1 <- glm(exact_match ~ log(nFreq + .5)+ log(orig_len + .5) + log(var_in_scope + .5) + log(var_in_line+.5) + log(scope_depth +.5) + log(slist_size + .5) + renaming_strat + consistency_strat,family=binomial(link='logit'), data = renamed)
summary(m1)

m2 <- glm(in_suggest ~ log(nFreq + .5)+ log(orig_len + .5) + log(var_in_scope + .5) + log(var_in_line+.5) + log(scope_depth +.5) + log(slist_size + .5) + renaming_strat + consistency_strat,family=binomial(link='logit'), data = renamed)
summary(m2)

m3 <- glm(approx_suggest ~ log(nFreq + .5)+ log(orig_len + .5) + log(var_in_scope + .5) + log(var_in_line+.5) + log(scope_depth +.5) + log(slist_size + .5) + renaming_strat + consistency_strat,family=binomial(link='logit'), data = renamed)
summary(m3)

exactMatch <- sqldf("SELECT * FROM renamed WHERE orig_name==choosen_renaming")
misMatch <- sqldf("SELECT * FROM renamed WHERE orig_name!=choosen_renaming")
#What could we exact match?
inSuggestion <- misMatch[misMatch$in_suggest == 'True',]


#What could we approximately match?
notInSuggestion  <- misMatch[misMatch$in_suggest == 'False',]
case_in   <- notInSuggestion[notInSuggestion$lc_suggest=="True",]
nspec <- notInSuggestion[notInSuggestion$nspec_suggest=="True",]
contains <- notInSuggestion[notInSuggestion$contain_suggest=="True",]
abbrev <- notInSuggestion[notInSuggestion$abbrev_suggest=="True",]
approx <- misMatch[misMatch$approx_correct=="True",]
any_approx <- notInSuggestion[notInSuggestion$abbrev_suggest=="True" | notInSuggestion$lc_suggest=="True" | notInSuggestion$nspec_suggest=="True" | notInSuggestion$contain_suggest=="True",]
am_reduced <- sqldf("SELECT MIN(choosen_renaming) as choosen_renaming, MIN(suggestion_list) as suggestion_list, MIN(orig_name) as orig_name from any_approx GROUP BY suggestion_list;")
no_approx_match <- notInSuggestion[!(notInSuggestion$abbrev_suggest=="True" | notInSuggestion$lc_suggest=="True" | notInSuggestion$nspec_suggest=="True" | notInSuggestion$contain_suggest=="True"),]
nam_reduced <- sqldf("SELECT MIN(choosen_renaming) as choosen_renaming, MIN(suggestion_list) as suggestion_list, MIN(orig_name) as orig_name from no_approx_match GROUP BY suggestion_list;")
nrow(case_in)
nrow(nspec)
nrow(contains)
nrow(abbrev)
nrow(any_approx)
nrow(exactMatch)/nrow(renamed)
(nrow(inSuggestion)+nrow(exactMatch))/nrow(renamed)
(nrow(inSuggestion)+nrow(exactMatch)+nrow(any_approx))/nrow(renamed)
View(am_reduced)

#How is the exact + exact in suggestion + approximate in suggestion breakdown within the 4 different listed strategies?
denom_strats <- sqldf("SELECT consistency_strat, renaming_strat,count(*) as denom FROM renamed GROUP BY consistency_strat, renaming_strat")
e_strats <- sqldf("SELECT consistency_strat, renaming_strat,count(*) as exact FROM exactMatch GROUP BY consistency_strat, renaming_strat")
a_strats <- sqldf("SELECT consistency_strat, renaming_strat,count(*) as approx FROM approx GROUP BY consistency_strat, renaming_strat")
iS_strats <- sqldf("SELECT consistency_strat, renaming_strat,count(*) as exact_suggest FROM inSuggestion GROUP BY consistency_strat, renaming_strat")
approx_strats <- sqldf("SELECT consistency_strat, renaming_strat,count(*) as approx_suggest FROM any_approx GROUP BY consistency_strat, renaming_strat")
accuracy1 = merge(denom_strats, e_strats, by = c("consistency_strat", "renaming_strat"))
accuracy2 = merge(approx_strats, iS_strats, by = c("consistency_strat", "renaming_strat"))
accuracy = merge(accuracy1, accuracy2, by = c("consistency_strat", "renaming_strat"))
accuracy = merge(accuracy, a_strats, by = c("consistency_strat", "renaming_strat"))
accuracy$e_acc = accuracy$exact/accuracy$denom
accuracy$a_acc = (accuracy$exact+accuracy$approx)/accuracy$denom
accuracy$es_acc = (accuracy$exact + accuracy$exact_suggest)/accuracy$denom
accuracy$as_acc = (accuracy$exact + accuracy$exact_suggest + accuracy$approx_suggest)/accuracy$denom
#How do different suggestion lists vary between variable instances? Also weird...
tmp = sqldf("SELECT filename, orig_name, scope_id, suggestion_list, choosen_renaming FROM misMatch GROUP BY filename, orig_name, scope_id, suggestion_list, choosen_renaming")
tmp2 =  sqldf("SELECT * FROM tmp WHERE count(")

#What fails?
View(nam_reduced)

#Bring back the n2p rates. -> What is number where n2p fails that we get and vice versa?
#I want what? (Super basic) of overlapping rows -> # js nice right that we didn't, # we got right and js nice didn't
#renamed <- sqldf("SELECT r.*, n.choosen_renaming as jsnice_choice FROM renamed as r INNER JOIN n2p as n ON(r.filename = n.filename AND r.scope_id = n.scope_id AND r.line_index = n.line_index AND r.token_line_id = n.token_line_id)")

#renamed$jsnice_correct <-renamed$jsnice_choice == renamed$orig_name
#toolOverlap <- merge(renamed,n2p, by=c("filename", "scope_id", "line_index", "token_line_id"))
#View(toolOverlap)


#Model
#exact model ~ renaming_
