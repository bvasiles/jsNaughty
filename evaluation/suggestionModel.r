library(car)
library(lme4)
library(pscl)
library(sqldf)
library(stats)
library(stargazer)

source("~/jsnaughty/evaluation/stat_helper.r", encoding = 'UTF-8')
source("~/jsnaughty/evaluation/suggestionWeight.r", encoding = 'UTF-8')

suggestion_model <- read.csv("~/jsnaughty/evaluation/suggestion_model_15_approx.csv", header=FALSE, sep=";")
#suggestion_model <- read.csv("~/jsnaughty/evaluation/suggestion_model_14_approx.csv", header=FALSE, sep=";")

#colnames(suggestion_model) <- c("file", "original_name", "renaming_type", "minified_name", 
#                                "line_num", "token_num", "suggestion_option",
#                                "lines_on", "max_on_one_line", "external_def", "external_use",
#                                "for_use", "while_use", "literal_def", "literal_use",
#                                "max_line_length","ave_line_length","lines_suggested_for",
#                                "length", "camel_case", "underscore", "dollar_sign",
#                                "ave_log_prob","ave_log_drop", "min_gain", "max_gain",
#                                "approx_match", "case_insen", "non_spec", "contains", "abbrev", "var_id")

#v14+ version
colnames(suggestion_model) <- c("file", "original_name", "renaming_type", "minified_name", 
                               "line_num", "token_num", "suggestion_option", "jsnice_name",
                               "lines_on", "max_on_one_line", "external_def", "external_use",
                               "for_use", "while_use", "literal_def", "literal_use",
                               "max_line_length","ave_line_length","lines_suggested_for",
                               "length", "camel_case", "underscore", "dollar_sign",
                               "ave_log_prob","ave_log_drop", "min_gain", "max_gain",
                               "jsnice_approx_match","approx_match", "case_insen", "non_spec", "contains", "abbrev", "var_id")

#candidates<- read.csv("~/jsnaughty/evaluation/candidates_13.csv", header=FALSE, sep=";")
#colnames(candidates) <- c("file","renaming_type","consistency_strat","scope_id",
#                          "line_num","token_num","is_global","suggestion_option",
#                          "suggestion_list")

#numerical columns we can plot histograms of.
numCols <- c("lines_on", "max_on_one_line", "external_use", 
             "for_use", "while_use", "literal_use", "max_line_length", 
             "ave_line_length", "lines_suggested_for", "length",
             "ave_log_prob","ave_log_drop", "min_gain", "max_gain")

View(suggestion_model)
nrow(table(suggestion_model$file))
#Want a script to implement my approx match...
suggestion_model$exact_match <- as.character(suggestion_model$original_name) == as.character(suggestion_model$suggestion_option)
suggestion_model$jsnice_match <- as.character(suggestion_model$original_name) == as.character(suggestion_model$jsnice_name)
suggestion_model$approx_match <- suggestion_model$approx_match == "True"
suggestion_model$jsnice_approx_match <- suggestion_model$jsnice_approx_match == "True"

suggestion_model <- suggestion_model[suggestion_model$ave_log_prob >= -70,]
suggestion_model <- suggestion_model[suggestion_model$for_use <= 5,]
suggestion_model <- suggestion_model[suggestion_model$while_use <= 10,]
suggestion_model <- suggestion_model[suggestion_model$literal_use <= 10,]
suggestion_model <- suggestion_model[suggestion_model$external_use <= 10,]
suggestion_model <- suggestion_model[suggestion_model$lines_suggested_for <= 10,]


s_nr <- suggestion_model[suggestion_model$renaming_type=="no_renaming",]
s_hr <- suggestion_model[suggestion_model$renaming_type=="hash_def_one_renaming",]

table(s_nr$exact_match)[2]/nrow(s_nr)
table(s_hr$exact_match)[2]/nrow(s_hr)

table(s_nr$approx_match)[2]/nrow(s_nr)
table(s_hr$approx_match)[2]/nrow(s_hr)


draw_histograms(s_nr, numCols, "~/jsnaughty/evaluation/Plots/NoRenamingHists.png")
draw_histograms(s_hr, numCols, "~/jsnaughty/evaluation/Plots/HashDefOneRenamingHists.png")

cor_heatmap(s_nr, numCols, "~/jsnaughty/evaluation/Plots/NoRenamingHM.png")
cor_heatmap(s_hr, numCols, "~/jsnaughty/evaluation/Plots/HashDefOneRenamingHM.png")

#Non-mixed, everything model.
#Log
# lmh1 <- lm(exact_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#              log(external_use + .01) + for_use + while_use + literal_def + literal_use + 
#              max_line_length + log(ave_line_length + .01) + lines_suggested_for + 
#              log(length + .01) + camel_case + underscore + dollar_sign + log(-ave_log_prob +.01) +
#              ave_log_drop + min_gain + max_gain, data = s_hr)
# summary(lmh1)
# anova(lmh1)
# vif(lmh1)
# plot(lmh1)
# 
# lmha1 <- lm(approx_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#              log(external_use + .01) + for_use + while_use + literal_def + literal_use + 
#              max_line_length + log(ave_line_length + .01) + lines_suggested_for + 
#              log(length + .01) + camel_case + underscore + dollar_sign + log(-ave_log_prob +.01) +
#              ave_log_drop + min_gain + max_gain, data = s_hr)
# summary(lmha1)
# anova(lmha1)
# vif(lmha1)
# plot(lmha1)

# 
# #Linear separation (not really a good model?)
# lmh2 <- glm(exact_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#        external_use + for_use + while_use + literal_def + literal_use + 
#        max_line_length + ave_line_length + lines_suggested_for + 
#        log(length + .01) + camel_case + underscore + dollar_sign + ave_log_prob +
#        ave_log_drop + max_gain, data = s_hr, family="binomial")
# 
# lmh2_odds <- exp(cbind(Odds=coef(lmh2), confint(lmh2)))
# 
# #Dropped: min and max due to high vif
# summary(lmh2)
# anova(lmh2)
# vif(lmh2)
# plot(lmh2)
# 
# #No linear separation.
# lmha2 <- glm(approx_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#               external_use + for_use + while_use + literal_def + literal_use + 
#               max_line_length + ave_line_length + lines_suggested_for + (length>1.0) +
#               log(length + .01) + camel_case + underscore + dollar_sign + ave_log_prob +
#               ave_log_drop + max_gain, data = s_hr, family="binomial")
# 
# lmha2_odds <- exp(cbind(Odds=coef(lmha2), confint(lmha2)))
# #Dropped: min and max due to high vif
# summary(lmha2)
# anova(lmha2)
# vif(lmha2)
# 
# #Drop some more insignificant ones. (for_use and literal_use were significant but anova is practically 0)
# lmh3 <-  glm(exact_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#                external_use  + literal_def + 
#                ave_line_length + lines_suggested_for  + (length>1) +
#                log(length + .01) + camel_case + underscore + dollar_sign + ave_log_prob +
#                ave_log_drop, data = s_hr, family="binomial")
# 
# #Get odds ratios:
# lmh3_odds <- exp(cbind(Odds=coef(lmh3), confint(lmh3)))
# 
# summary(lmh3)
# anova(lmh3)
# vif(lmh3)
# #plot(lmh3)
# pR2(lmh3)
# 
# #Camel case is meaningless in the approx match model (likely because we're matching elsewhere?)
# #The average log prob is subsumed into ave_log_drop almost entirely too...
# lmha3 <- glm(approx_match ~  max_on_one_line + external_def +
#               literal_def  + lines_suggested_for + (length>1.0) +
#               log(length + .01)  + ave_log_prob +
#               ave_log_drop, data = s_hr, family="binomial")
# 
# #Get odds ratios:
# lmha3_odds <- exp(cbind(Odds=coef(lmha3), confint(lmha3)))
# 
# summary(lmha3)
# anova(lmha3)
# vif(lmha3)
# plot(lmha3)
# 1 - 65687/82604

shm = subset(s_hr, exact_match)
nrow(shm)
# head(shm)

shn = subset(s_hr, !exact_match)
nrow(shn)
# head(shn)

#Select only those where the correct answer can be found.
shn2 = sqldf("SELECT shn.* FROM shm INNER JOIN shn ON (shm.file = shn.file AND shm.line_num = shn.line_num AND shm.token_num = shn.token_num)")
nrow(shn2)

# boxplot(shm$len, shn$len, names=c("match","non-match"), log="y")


sh1 = subset(s_hr, !jsnice_match)
nrow(sh1)
# head(sh1)

sh2 = subset(s_hr, jsnice_match)
nrow(sh2)

# boxplot(sh1$len, sh2$len, shn$len, names=c("Naughty","Nice","Neither"), log="y")
# boxplot(sh1$linesSuggested, sh2$linesSuggested, shn$linesSuggested, names=c("Naughty","Nice","Neither"), log="y")
# boxplot(sh1$aveLineLength, sh2$aveLineLength, shn$aveLineLength, names=c("Naughty","Nice","Neither"), log="y")
# boxplot(sh1$aveLogProb, sh2$aveLogProb, shn$aveLogProb, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$aveLogDrop, sh2$aveLogDrop, shn$aveLogDrop, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$maxGain, sh2$maxGain, shn$maxGain, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$minGain, sh2$minGain, shn$minGain, names=c("Naughty","Nice","Neither"))
# boxplot(sh1$usageExternal, sh2$usageExternal, shn$usageExternal, names=c("Naughty","Nice","Neither"))

shn.sample = shn[sample(nrow(shn), nrow(shm)), ]
nrow(shn.sample)

shn2.sample = shn2[sample(nrow(shn2), nrow(shm)), ]
nrow(shn2.sample)

#Balanced
bs_hr = rbind(shm, shn.sample)
bs_hr2 = rbind(shm, shn2.sample)
#Balanced and from lists where there is a correct answer

#Can I do this sysmatically (generate all the models in the space and brute force a good one?)

lmh4 <- glm(exact_match ~ log(lines_on + .01) + (max_on_one_line > 1) + external_def + 
               (external_use > 1) + (for_use > 1) + literal_def + (literal_use > 1) + 
               max_line_length  + (lines_suggested_for > 1) + 
               (length > 1) + camel_case + underscore + dollar_sign + ave_log_prob +
              max_gain, data = bs_hr2, family="binomial")


#With more controls (Better with controls...) but no name variables
lmh4 <- glm(exact_match ~ log(lines_suggested_for + .01)  + 
              (length > 1) + ave_log_drop + ave_log_prob + camel_case + underscore + dollar_sign + max_gain, data = bs_hr2, family="binomial")


#lmh4_odds <- exp(cbind(Odds=coef(lmh4), confint(lmh4)))
summary(lmh4)
pR2(lmh4)
vif(lmh4)
anova(lmh4)
stargazer(lmh4)

#Unbalanced, but there exists a correct answer.
s_chr <- rbind(shm, shn2)
lmh5 <- glm(exact_match ~ log(lines_suggested_for + .01)  + 
              (length > 1) + ave_log_drop + ave_log_prob + camel_case + underscore + dollar_sign + max_gain, data = s_chr, family="binomial")
summary(lmh5)
pR2(lmh5)
vif(lmh5)
anova(lmh5)
#Weight building

#1. Ave log prob based.
s_hr$base_weight <- calculateWeight(s_hr, NULL, c(), c("ave_log_prob") ,c())

#2. lmh4 based.
#No simple name features

transforms <- c("log","thres", "base" ,"base")
s_hr$model4_weight <- calculateWeightLog(s_hr, lmh4, c(2:5), c("lines_suggested_for", "length", "ave_log_drop","ave_log_prob"), transforms)

transforms <- c("log","thres", "base" ,"base")
s_chr$model5_weight <- calculateWeightLog(s_chr, lmh5, c(2:5), c("lines_suggested_for", "length", "ave_log_drop","ave_log_prob"), transforms)


top_base <- sqldf("SELECT MAX(base_weight) as base_weight, var_id FROM s_hr GROUP BY var_id")
top_4 <- sqldf("SELECT MAX(model4_weight) as model4_weight, var_id FROM s_hr GROUP BY var_id")
top_5 <- sqldf("SELECT MAX(model5_weight) as model5_weight, var_id FROM s_chr GROUP BY var_id")

#We need to select one where there are duplicate best matches by the model?
best_b <- sqldf("SELECT s_hr.* FROM s_hr INNER JOIN top_base on (s_hr.base_weight = top_base.base_weight and s_hr.var_id = top_base.var_id)")
best_4 <- sqldf("SELECT s_hr.* FROM s_hr INNER JOIN top_4 on (s_hr.model4_weight = top_4.model4_weight and s_hr.var_id = top_4.var_id)")
best_5 <- sqldf("SELECT s_chr.* FROM s_chr INNER JOIN top_5 on (s_chr.model5_weight = top_5.model5_weight and s_chr.var_id = top_5.var_id)")

table(best_b$exact_match)
table(best_b$exact_match)[[2]]/nrow(best_b)
table(best_4$exact_match)
table(best_4$exact_match)[[2]]/nrow(best_4)
table(best_5$exact_match)
table(best_5$exact_match)[[2]]/nrow(best_5)

#plot(lmh4)


# lmha4 <- glm(approx_match ~ log(lines_on + .01) + (max_on_one_line > 1) + external_def + 
#               (external_use > 1) + (for_use > 1) + literal_def + (literal_use > 1) + 
#               max_line_length  + (lines_suggested_for > 1) + (length > 1) +
#               log(length + .01) + camel_case + underscore + dollar_sign + ave_log_prob +
#               + max_gain, data = bs_hr, family="binomial")
# summary(lmha4)
# pR2(lmha4)
# vif(lmha4)
# anova(lmha4)
# #plot(lmha4)
# 
# #When is it not even in the suggestion list?
# #Max acts as an OR on booleans?
# summary_sugg <- sqldf("SELECT original_name, minified_name, MIN(jsnice_name), lines_on, max_on_one_line, external_def, external_use, literal_def, literal_use, for_use, while_use, max_line_length, ave_line_length, MAX(exact_match) as e_match, MAX(approx_match) as a_match, MAX(jsnice_match) as j_match, MAX(jsnice_approx_match) as ja_match, var_id FROM s_hr GROUP BY original_name, minified_name, lines_on, max_on_one_line, external_def, external_use, literal_def, literal_use, for_use, while_use, max_line_length, ave_line_length, var_id")
# 
# nes <- subset(summary_sugg, !e_match)
# nas <- subset(summary_sugg, !a_match)
# 
# njs <- subset(summary_sugg, !j_match)
# 
# #Implement prediction model -> calculate weight from the ratios/ log probs and do it here, compare before implementing...
# #Then select best weight by var_id and compare...
# 
# #JSNice blending ---------------------- (Not very good from these, but an addition 20% of the missing cases in our suggestions could be fit with jsnice...)
# m_js0 <- glm(j_match ~ log(lines_on + .01) + (max_on_one_line > 1) + external_def + 
#                (external_use > 1) + (for_use > 1) + literal_def + (literal_use > 1) + 
#                max_line_length  + ave_line_length, data = nes, family="binomial")
# summary(m_js0)
# vif(m_js0)
# anova(m_js0)
# 
# 
# 
# bs_hr$improve = !bs_hr$exact_match & bs_hr$jsnice_match
# m_js1 <- glm(improve ~ log(lines_on + .01) + (max_on_one_line > 1) + external_def + 
#               (external_use > 1) + (for_use > 1) + literal_def + (literal_use > 1) + 
#               max_line_length  + (lines_suggested_for > 1) + + (length > 1) +
#               log(length + .01) + camel_case + underscore + dollar_sign + ave_log_prob +
#               + max_gain, data = bs_hr, family="binomial")
# 
# summary(m_js1)
# pR2(m_js1)
# vif(m_js1)
# anova(m_js1)
# #Its bad when we have few lines suggested for and when log drop
# 
# #What about the entropy of the lines suggested for? (e.g. if they are all 1's go with jsnice maybe?)
# suggestion_entropy_15 <- read.csv("~/jsnaughty/evaluation/suggestion_entropy_15.csv", header=FALSE, sep=";")
# colnames(suggestion_entropy_15) <- c("var_id", "entropy")
# 
# #Build a per name version
# by_name <- sqldf("SELECT MAX(lines_on), MAX(max_on_one_line), MAX(external_def), MAX(external_use), MAX(for_use), MAX(literal_def), MAX(literal_use), MAX(max_line_length), MAX(ave_line_length), MAX(jsnice_match), MAX(jsnice_approx_match), var_id, file FROM s_hr GROUP BY var_id, file")
# colnames(by_name) <- c("lines_on", "max_on_one_line", "external_def", "external_use","for_use", "literal_def", "literal_use","max_line_length","ave_line_length", "jsnice_match", "jsnice_approx_match", "var_id", "file")
# by_name <- merge(by_name, suggestion_entropy_15, by=c("var_id"))
# 
# temp <- sqldf("SELECT s_hr.suggestion_option, s_hr.exact_match, s_hr.approx_match, s_hr.model4_weight, s_hr.var_id FROM s_hr INNER JOIN top_4 on (s_hr.model4_weight = top_4.model4_weight and s_hr.var_id = top_4.var_id) ")
# 
# by_name <- merge(by_name, temp, by=c("var_id"))
# both_true = table(by_name$exact_match & by_name$jsnice_match)[[2]]
# us_true = table(by_name$exact_match & !by_name$jsnice_match)[[2]]
# them_true = table(!by_name$exact_match & by_name$jsnice_match)[[2]]
# neither_true = table(!by_name$exact_match & !by_name$jsnice_match)[[2]]
# mix_limit <- matrix(c(both_true, them_true, us_true, neither_true),2,2, byrow=TRUE)
# #Mcnemar's test
# mcnemar.test(mix_limit)
# #effect size fo mcnemar test?
# 
# us_gain <- them_true/nrow(by_name)
# them_gain <- us_true/nrow(by_name)
# 
# #File-accuracy version.
# by_name$exact_match <- as.integer(as.logical(by_name$exact_match))
# by_name$jsnice_match <- as.integer(as.logical(by_name$jsnice_match))
# by_file <- sqldf("SELECT file, sum(exact_match) as correct, sum(jsnice_match) as jsnice_correct, count(*) as vars FROM by_name GROUP BY file")
# by_file$acc <- by_file$correct/by_file$vars
# by_file$jsnice_acc <- by_file$jsnice_correct/by_file$vars
# boxplot(by_file$acc, by_file$jsnice_acc)
# 
# #When do we not get it in the suggestion list at all and jsnice does?
# by_name$improve = !by_name$exact_match & by_name$jsnice_match
# m_js2 <- glm(exact_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#                external_use + for_use  + literal_def + literal_use + 
#                max_line_length + entropy, data = by_name, family="binomial")
# summary(m_js2)
# vif(m_js2)
# anova(m_js2)

#problem is that jsnice still seems to be better than the best logistic model we have for picking on a variable
#to variable basis -> I think Bogdan's per file thing is misleading?


#Logistic mixed model?
# http://www.ats.ucla.edu/stat/r/dae/melogit.htm
#mixed_a <- glmer(approx_match ~ log(lines_on + .01) + max_on_one_line + external_def + 
#        + literal_def + 
#        max_line_length + lines_suggested_for + 
#        log(length + .01)  + dollar_sign + log(-ave_log_prob +.01) +
#        ave_log_drop + (1|file), data = s_hr, family = binomial, control = glmerControl(optimizer = "bobyqa"), nAGQ = 10)

#Correct names
#correctNames <- sqldf("SELECT file, original_name, line_num, token_num FROM s_hr GROUP BY file, original_name, line_num, token_num")
#JSNice comparison
#jsnice <- sqldf("SELECT * FROM candidates WHERE renaming_type = \'n2p\';")
#jsnice <- sqldf("SELECT file,renaming_type,line_num, token_num,suggestion_option FROM candidates WHERE renaming_type = \'n2p\' AND is_global = \'False\';")
#nrow(jsnice)
#jsnice2 <- merge(jsnice, correctNames, by = c("file", "line_num", "token_num"))
#nrow(jsnice2)
