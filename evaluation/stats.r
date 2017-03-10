# t <- read.table("~/workspace2/deobfuscator/data/t.csv", sep=";", quote="\"")
# df = t[t$V3>=10 & t$V3<=100 & t$V4<=20,]
# write.table(df[sample(nrow(df), 10000), 1], 
#             file="~/workspace2/deobfuscator/data/sample.test.10000.csv", 
#             sep=";", quote=F, row.names=F, col.names=F)

# log.100k <- read.table("~/workspace2/deobfuscator/data/log_test_js_files.csv", sep=";", quote="\"")
# names(log.100k) = c("file", "status")
# head(log.100k)
# table(log.100k$status)
# 
# stats.6k <- read.csv("~/workspace2/deobfuscator/data/stats.6k.100k_ini.csv", sep=";")
# stats.10k <- read.csv("~/workspace2/deobfuscator/data/stats.10k.csv", sep=";")
# stats.25k <- read.csv("~/workspace2/deobfuscator/data/stats.25k.csv", sep=";")
# stats.50k <- read.csv("~/workspace2/deobfuscator/data/stats.50k.csv", sep=";")
# stats.100k <- read.csv("~/workspace2/deobfuscator/data/stats.100k.csv", sep=";")
# stats.300k <- read.csv("~/workspace2/deobfuscator/data/stats.300k.csv", sep=";")
# stats.300k.fb <- read.csv("~/workspace2/deobfuscator/data/stats.300k.updated.bug.csv", sep=";")
# 
# bp_all = function(col_num, col_denom){
#   l = list(c6k=stats.6k[,which(names(stats.6k)==col_num)]/stats.6k[,which(names(stats.6k)==col_denom)],
#            c10k=stats.10k[,which(names(stats.10k)==col_num)]/stats.10k[,which(names(stats.10k)==col_denom)],
#            c25k=stats.25k[,which(names(stats.25k)==col_num)]/stats.25k[,which(names(stats.25k)==col_denom)],
#            c50k=stats.50k[,which(names(stats.50k)==col_num)]/stats.50k[,which(names(stats.50k)==col_denom)],
#            c100k=stats.100k[,which(names(stats.100k)==col_num)]/stats.100k[,which(names(stats.100k)==col_denom)])
#   par(mar=c(4,5,2,2))
#   boxplot(l, main=col_num)
# }
# 
# bp_all("Nice2Predict_all", "num_names")
# bp_all("no_renaming_freqlen_all", "num_names")
# bp_all("no_renaming_lm_all", "num_names")
# bp_all("no_renaming_unscoped_lm_all", "num_names")
# 
# names(stats.6k)
# names(stats.100k)
# names(stats.300k)
# 
# bp = function(col_num, col_denom){
#   l = list(c6k=stats.6k[,which(names(stats.6k)==col_num)]/stats.6k[,which(names(stats.6k)==col_denom)],
#            c10k=stats.10k[,which(names(stats.10k)==col_num)]/stats.10k[,which(names(stats.10k)==col_denom)],
# #            c25k=stats.25k[,which(names(stats.25k)==col_num)]/stats.25k[,which(names(stats.25k)==col_denom)],
# #            c50k=stats.50k[,which(names(stats.50k)==col_num)]/stats.50k[,which(names(stats.50k)==col_denom)],
#            c100k=stats.100k[,which(names(stats.100k)==col_num)]/stats.100k[,which(names(stats.100k)==col_denom)],
#            c300k=stats.300k[,which(names(stats.300k)==col_num)]/stats.300k[,which(names(stats.300k)==col_denom)],
#            c300k.fb=stats.300k.fb[,which(names(stats.300k.fb)==col_num)]/stats.300k.fb[,which(names(stats.300k.fb)==col_denom)],
#            n2p=stats.300k.fb$Nice2Predict_all/stats.300k.fb[,which(names(stats.300k.fb)==col_denom)])
#   par(mar=c(4,5,2,2))
#   boxplot(l, main=col_num)
# }
# 
# bp("hash_def_one_renaming_lm_all", "num_names")
# bp("hash_def_one_renaming_freqlen_all", "num_names")
# 
# bp("no_renaming_lm_all", "num_names")
# bp("no_renaming_freqlen_all", "num_names")
# 
# bp("no_renaming_unscoped_lm_all", "num_names")
# 
# 
# bp.glb = function(col_num, col_denom){
#   l = list(c6k=stats.6k[,which(names(stats.6k)==col_num)]/stats.6k[,which(names(stats.6k)==col_denom)],
#            #            c10k=stats.10k[,which(names(stats.10k)==col_num)]/stats.10k[,which(names(stats.10k)==col_denom)],
#            #            c25k=stats.25k[,which(names(stats.25k)==col_num)]/stats.25k[,which(names(stats.25k)==col_denom)],
#            #            c50k=stats.50k[,which(names(stats.50k)==col_num)]/stats.50k[,which(names(stats.50k)==col_denom)],
#            c100k=stats.100k[,which(names(stats.100k)==col_num)]/stats.100k[,which(names(stats.100k)==col_denom)],
#            c300k=stats.300k[,which(names(stats.300k)==col_num)]/stats.300k[,which(names(stats.300k)==col_denom)])#,
#   par(mar=c(4,5,2,2))
#   boxplot(l, main=col_num)
# }
# 
# 
#   
# 
# bp.local = function(col_num, col_denom){
#   l = list(c6k=stats.6k[,which(names(stats.6k)==col_num)]/stats.6k[,which(names(stats.6k)==col_denom)],
#            #            c10k=stats.10k[,which(names(stats.10k)==col_num)]/stats.10k[,which(names(stats.10k)==col_denom)],
#            #            c25k=stats.25k[,which(names(stats.25k)==col_num)]/stats.25k[,which(names(stats.25k)==col_denom)],
#            #            c50k=stats.50k[,which(names(stats.50k)==col_num)]/stats.50k[,which(names(stats.50k)==col_denom)],
#            c100k=stats.100k[,which(names(stats.100k)==col_num)]/stats.100k[,which(names(stats.100k)==col_denom)],
#            c300k=stats.300k[,which(names(stats.300k)==col_num)]/stats.300k[,which(names(stats.300k)==col_denom)],
#            n2p=stats.100k$Nice2Predict/stats.100k[,which(names(stats.100k)==col_denom)])
#   par(mar=c(4,5,2,2))
#   boxplot(l, main=col_num)
# }
# bp.local("hash_def_one_renaming_lm", "num_loc_names")
# 
# 
# 
# par(mar=c(15,5,2,2))
# boxplot(stats.300k[,5:11]/stats.300k[,4], las=2, ylab=paste("% names recovered -", nrow(stats.300k), "files"))
# boxplot(stats.300k.fb[,12:18]/stats.300k.fb[,2], las=2, ylab=paste("% names recovered -", nrow(stats.300k.fb), "files"))
# 
# stats <- read.csv("~/workspace2/deobfuscator/data/stats.100k.csv", sep=";")
# boxplot(stats[,5:12]/stats[,4], las=2, ylab=paste("% names recovered -", nrow(stats), "files"))
# boxplot(stats[,13:20]/stats[,2], las=2, ylab=paste("% names recovered -", nrow(stats), "files"))
# 
# 
# stats1 <- read.csv("~/workspace2/deobfuscator/data/stats.6k.orig_ini.csv", sep=";")
# stats2 <- read.csv("~/workspace2/deobfuscator/data/stats.6k.100k_ini.csv", sep=";")
# 
# # Local
# boxplot(stats1[,5:12]/stats1[,4], las=2, ylab=paste("% names recovered -", nrow(stats1), "files"))
# boxplot(stats2[,5:12]/stats2[,4], las=2, ylab=paste("% names recovered -", nrow(stats2), "files"))
# # All
# boxplot(stats1[,13:20]/stats1[,2], las=2, ylab=paste("% names recovered -", nrow(stats1), "files"))
# boxplot(stats2[,13:20]/stats2[,2], las=2, ylab=paste("% names recovered -", nrow(stats2), "files"))

stats <- read.csv("~/workspace2/deobfuscator/data/stats.200.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/data/stats.3240030.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/results/stats.10k.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/results/stats.200.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/data/stats.v9.csv", sep=";")
stats.tuned <- read.csv("~/workspace2/deobfuscator/data/stats.v9.tuned.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/data/stats.v9.tuned.lm2.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/data/stats.v10.lm2.csv", sep=";")
stats <- read.csv("~/workspace2/deobfuscator/data/stats.v13.csv", sep=";")
stats <- read.csv("~/jsnaughty/evaluation/stats_v16.csv", sep=";")

s = merge(stats, stats.tuned)

View(stats)

nrow(stats)
nrow(stats.tuned)
names(stats)
stats = subset(stats, num_loc_names > 0)

pdf(file="~/workspace2/deobfuscator/data/results.pdf", width=12, height=9)
par(mar=c(15,5,2,2))

boxplot((stats[,16:26])/stats[,2], las=2, ylab=paste("% all names recovered -", nrow(stats), "files"))

# -----
boxplot(stats[,5:11]/stats[,4], las=2, ylab=paste("% local names recovered -", nrow(stats), "files"))

boxplot(stats[,5:15]/stats[,4], las=2, ylab=paste("% local names recovered -", nrow(stats), "files"))

#boxplot(stats[,38:48]/stats[,4], las=2, ylab=paste("% maybe local names recovered -", nrow(stats), "files"))

boxplot(cbind(stats[,5:6],stats[,40:45])/stats[,4], las=2, ylab=paste("% names recovered -", nrow(stats), "files"))

boxplot((stats[,5:15]+stats[,3])/stats[,2], las=2, ylab=paste("% names recovered -", nrow(stats), "files"))

boxplot((stats[,27:37])/stats[,3], las=2, ylab=paste("% names recovered -", nrow(stats), "files"))

# -----
boxplot((stats[,26:32])/stats[,4], las=2, ylab=paste("% names recovered -", nrow(stats), "files"))

dev.off()

plot(stats$hash_def_one_renaming_lmdrop/stats$num_loc_names, stats$n2p/stats$num_loc_names)

library(lsr)
cohensD(stats$hash_def_one_renaming_lm/stats$num_loc_names, stats$n2p/stats$num_loc_names, method="paired")
wilcox.test(stats$hash_def_one_renaming_lm/stats$num_loc_names, stats$n2p/stats$num_loc_names,paired=TRUE,alt="g")

wilcox.test(stats$hash_def_one_renaming_logmodel/stats$num_loc_names, stats$n2p/stats$num_loc_names,paired=TRUE,alt="g")

wilcox.test(stats$hash_def_one_renaming_lm/stats$num_loc_names, stats$hash_def_one_renaming_logmodel/stats$num_loc_names,paired=TRUE,alt="l")
cohensD(stats$hash_def_one_renaming_lm/stats$num_loc_names, stats$hash_def_one_renaming_logmodel/stats$num_loc_names)
par(mar=c(5,5,2,2))
plot(stats$hash_def_one_renaming_lm/stats$num_loc_names, stats$n2p/stats$num_loc_names)


boxplot(cbind(stats[,5:6],stats[,40:45])/stats[,4], las=2)


sanity.300k <- read.table("~/workspace2/deobfuscator/data/sanity.300k.updated.csv", sep=";", quote="\"")

