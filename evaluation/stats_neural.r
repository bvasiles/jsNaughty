#Plots:
#1) Local Only With Neural Added %1 vs 5% (Have it)
#2) Neural 1% and 5% vs Moses 1% and 5% Local Only + Exact
#3) Same as 2, but use approximate
#4) Is it in the suggestion list (exact vs approximate 1% and 5% moses)

#Files to load:
#stats_mix
#stats_no_mix
#stats_neural_fix_approx
#stats_neural_ks_approx (regenerate with new stats)
#stats_moses_1_percent_approx (being created)
#stats_moses_5_percent_approx (waiting on above)
#stats_neural_5_percent_approx (over Saturday)

#Also, this should have on the wilcox and cohensd D tests for these plots.

library(ggplot2)
library(lsr)
library(car)
library(reshape2)
library(effsize)
library(sqldf)

rFromWilcox<-function(wilcoxModel, N){
  z<- qnorm(wilcoxModel$p.value/2)
  r<- z/ sqrt(N)
  cat(wilcoxModel$data.name, "Effect Size, r = ", r)
}
#rFromWilcox(w,2*length(subset1$`Freq`))


#Saving 9.36 x 7.07 in image
#Before hash fix
stats_mix <- read.csv("~/jsnaughty/evaluation/stats_mix_final.csv", sep=";")

stats_nomix <- read.csv("~/jsnaughty/evaluation/stats_nomix_final.csv", sep=";")

#The version with lines removed (WARNING: MAY be that the tests are off and we need to remove
#the lines without changes...)
#Okay, I'm about 95% sure that this is actually the mixture between us and JSNice
#Which is terrible, b/c it means the neural model is basically not working at all :(
#stats_neural <- read.csv("~/jsnaughty/evaluation/neural_stats.csv", sep=";")
#stats_neural <- read.csv("~/jsnaughty/evaluation/neural_stats_fix.csv", sep=";")
#TODO: the approx isn't working for the individual words (need to rerun the scripts.)
stats_neural <- read.csv("~/jsnaughty/evaluation/neural_stats_fix_approx.csv", sep=";")

stats_neural_ks <- read.csv("~/jsnaughty/evaluation/neural_stats_ks_approx.csv", sep=";")

stats_moses_1_percent <- read.csv("~/jsnaughty/evaluation/stats_moses_1_percent_approx.csv", sep=";")
stats_moses_5_percent <- read.csv("~/jsnaughty/evaluation/stats_moses_5_percent_approx.csv", sep=";")

#Until we actually have this, use the 1%
stats_neural_5_percent <- read.csv("~/jsnaughty/evaluation/neural_stats_fix_approx.csv", sep=";")

#stats_neural_5_percent <- read.csv("~/jsnaughty/evaluation/stats_neural_5_percent_approx.csv", sep=";")

#There was a shift in how I ordered the files, make sure they are ordered and contain the same number of files.
sharedFiles <- sqldf("SELECT file from stats_mix WHERE file in (SELECT file FROM stats_neural) AND file in (SELECT file FROM stats_neural_ks) AND file in (SELECT file FROM stats_moses_1_percent) AND file in (SELECT file FROM stats_moses_5_percent) ORDER BY file")

stats_mix <- sqldf("SELECT * FROM stats_mix WHERE file in sharedFiles ORDER BY file")
stats_nomix <- sqldf("SELECT * FROM stats_nomix WHERE file in sharedFiles ORDER BY file")

stats_neural <- sqldf("SELECT * FROM stats_neural WHERE file in sharedFiles ORDER BY file")
stats_neural_ks <- sqldf("SELECT * FROM stats_neural_ks WHERE file in sharedFiles ORDER BY file")
stats_moses_1_percent <- sqldf("SELECT * FROM stats_moses_1_percent WHERE file in sharedFiles ORDER BY file")
stats_moses_5_percent <- sqldf("SELECT * FROM stats_moses_5_percent WHERE file in sharedFiles ORDER BY file")
stats_neural_5_percent <- sqldf("SELECT * FROM stats_neural_5_percent WHERE file in sharedFiles ORDER BY file")

#Validate file equality
stopifnot(stats_neural$file == stats_mix$file)
stopifnot(stats_neural$file == stats_nomix$file)
stopifnot(stats_neural$file == stats_neural_ks$file)
stopifnot(stats_neural$file == stats_moses_1_percent $file)
stopifnot(stats_neural$file == stats_moses_5_percent$file)
stopifnot(stats_neural$file == stats_neural_5_percent$file)
#----#

#Compare drop with no drop for exact vs approx and selected vs in list. (None were significantly different - the paired caused a p value error)
wilcox.test(stats_neural$nst_logmodel/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel/stats_neural_ks$num_loc_names, paired = TRUE)
cohensD(stats_neural$nst_logmodel/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel_approx/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_approx/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel_approx/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_approx/stats_neural_ks$num_loc_names, paired = TRUE)
cohensD(stats_neural$nst_logmodel_approx/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_approx/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel_maybe/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_maybe/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel_maybe/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_maybe/stats_neural_ks$num_loc_names, paired = TRUE)
cohensD(stats_neural$nst_logmodel_maybe/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_maybe/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel_approx_maybe/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_approx_maybe/stats_neural_ks$num_loc_names)
wilcox.test(stats_neural$nst_logmodel_approx_maybe/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_approx_maybe/stats_neural_ks$num_loc_names, paired = TRUE)
cohensD(stats_neural$nst_logmodel_approx_maybe/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel_approx_maybe/stats_neural_ks$num_loc_names)

#Plot 1)

subset2 <- cbind(stats_mix[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_mix[,c("num_loc_names")]
#Add in globals as well.
colnames(subset2) <- c("JSNaughty", "JSNice")
subset3 <- cbind(stats_nomix[,c("hash_def_one_renaming_logmodel", "n2p")])/stats_nomix[,c("num_loc_names")]

colnames(subset3) <- c("Autonym", "JSNice")
subset3$file <- stats_nomix$file

subset2$file <- stats_mix$file
subset2 <- cbind(subset2[,c("file","JSNaughty")])
subset2 <- merge(subset3, subset2, by = c("file"))

#Add in the neural names
subsetN <- cbind(stats_neural[,c("nst_logmodel")])/stats_neural[,c("num_loc_names")]
colnames(subsetN) <- c("Neural (1%)")
subsetN <- as.data.frame(subsetN)
subsetN$file <- as.factor(stats_neural$file)
subset2 <- merge(subset2, subsetN, by = c("file"))

#Add in the neural 5% names
subsetN5 <- cbind(stats_neural_5_percent[,c("nst_logmodel")])/stats_neural_5_percent[,c("num_loc_names")]
colnames(subsetN5) <- c("Neural (5%)")
subsetN5 <- as.data.frame(subsetN5)
subsetN5$file <- as.factor(stats_neural_5_percent$file)
subset2 <- merge(subset2, subsetN5, by = c("file"))



# #Drop the files missed entirely.
# subsetN_nozero <- subsetN[subsetN$`Neural Drop Lines` != 0.0,]
# summary(subsetN$`Neural Drop Lines`)
# summary(subsetN_nozero$`Neural Drop Lines`)
# 
# #What cases do we do better on, if any? (Never, basically)
# subset2$NBM <- subset2$JSNaughty < subset2$`Neural Drop Lines`
# subset2$NEM <- subset2$JSNaughty == subset2$`Neural Drop Lines`
# subset2$NB <- subset2$Autonym < subset2$`Neural Drop Lines`
# subset2$NE <- subset2$Autonym == subset2$`Neural Drop Lines`
# 
# table(subset2$NB)
# table(subset2$NE)
# table(subset2$NBM)
# table(subset2$NEM)
# 
# matched <- subset2[(subset2$NBM | subset2$NB) & subset2$`Neural Drop Lines` != 0,]
# matched <- sqldf("SELECT matched.*, stats_mix.num_loc_names FROM matched INNER JOIN stats_mix ON matched.file = stats_mix.file ORDER BY stats_mix.num_loc_names DESC")
# #Examples (Candidate for example path):
# #375816.js (Better than all of them - not a good example)
# #4149008.js (Equivalent to )
# matched <- matched[,c("file", "Autonym", "JSNice", "JSNaughty", "Neural Drop Lines", "num_loc_names")]

#Reorder the columns so they are plotted like we wish.
plot_data1 <- subset2[,c("Autonym", "JSNice", "JSNaughty", "Neural (1%)", "Neural (5%)")] #"JSNaughtyNeural", "JSNaughtyNeural (All)")]
colnames(plot_data1) <- c("Autonym", "JSNice", "JSNaughty", "Neural (1%)", "Neural (5%)")

pd1 <- melt(plot_data1)
mix_plot <- ggplot(pd1, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#ccbadd","#269441", "#99c2ff","#003380")) +
  #scale_fill_brewer(palette="Greens") + 
  #ggtitle("File level accuracy for JSnice, Autonym, and JSNaughty") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(pd1), "files"))
mix_plot
ggsave(mix_plot, file = "~/jsnaughty/evaluation/Plots/neuralBoxplot1.png", height= 7.07, width = 9.36, units = "in")


combinedSize <- data.frame(cbind(stats_moses_1_percent$file))
colnames(combinedSize) <- c("file")
combinedSize$moses1_exact <- stats_moses_1_percent[,c("jsn_logmodel")]/stats_moses_1_percent[,c("num_loc_names")]
combinedSize$moses1_approx <- stats_moses_1_percent[,c("jsn_logmodel_approx")]/stats_moses_1_percent[,c("num_loc_names")]
combinedSize$moses1_suggestion <- stats_moses_1_percent[,c("jsn_logmodel_maybe")]/stats_moses_1_percent[,c("num_loc_names")]
combinedSize$moses1_suggestion_approx <- stats_moses_1_percent[,c("jsn_logmodel_approx_maybe")]/stats_moses_1_percent[,c("num_loc_names")]

combinedSize$moses5_exact <- stats_moses_5_percent[,c("jsn_logmodel")]/stats_moses_5_percent[,c("num_loc_names")]
combinedSize$moses5_approx <- stats_moses_5_percent[,c("jsn_logmodel_approx")]/stats_moses_5_percent[,c("num_loc_names")]
combinedSize$moses5_suggestion <- stats_moses_5_percent[,c("jsn_logmodel_maybe")]/stats_moses_5_percent[,c("num_loc_names")]
combinedSize$moses5_suggestion_approx <- stats_moses_5_percent[,c("jsn_logmodel_approx_maybe")]/stats_moses_5_percent[,c("num_loc_names")]

combinedSize$neural1_exact <- stats_neural[,c("nst_logmodel")]/stats_neural[,c("num_loc_names")]
combinedSize$neural1_approx <- stats_neural[,c("nst_logmodel_approx")]/stats_neural[,c("num_loc_names")]
combinedSize$neural1_suggestion <- stats_neural[,c("nst_logmodel_maybe")]/stats_neural[,c("num_loc_names")]
combinedSize$neural1_suggestion_approx <- stats_neural[,c("nst_logmodel_approx_maybe")]/stats_neural[,c("num_loc_names")]

combinedSize$neural5_exact <- stats_neural_5_percent[,c("nst_logmodel")]/stats_neural_5_percent[,c("num_loc_names")]
combinedSize$neural5_approx <- stats_neural_5_percent[,c("nst_logmodel_approx")]/stats_neural_5_percent[,c("num_loc_names")]
combinedSize$neural5_suggestion <- stats_neural_5_percent[,c("nst_logmodel_maybe")]/stats_neural_5_percent[,c("num_loc_names")]
combinedSize$neural5_suggestion_approx <- stats_neural_5_percent[,c("nst_logmodel_approx_maybe")]/stats_neural_5_percent[,c("num_loc_names")]

#2) Neural 1% and 5% vs Moses 1% and 5% Local Only + Exact
plot_data2<- combinedSize[,c("moses1_exact", "neural1_exact", "moses5_exact", "neural5_exact")] 
colnames(plot_data2) <- c("Autonym (1%)", "Neural (1%)", "Autonym (5%)", "Neural (5%)")


pd2 <- melt(plot_data2)
mix_plot2 <- ggplot(pd2, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#ccbadd","#269441", "#99c2ff")) +
  #scale_fill_brewer(palette="Greens") + 
  ggtitle("File level accuracy for Autonym and Neural Exact Matching") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(pd2), "files"))
mix_plot2
ggsave(mix_plot2, file = "~/jsnaughty/evaluation/Plots/neuralBoxplot2.png", height= 7.07, width = 9.36, units = "in")

#3) Same as 2, but use approximate
plot_data3<- combinedSize[,c("moses1_approx", "neural1_approx", "moses5_approx", "neural5_approx")] 
colnames(plot_data3) <- c("Autonym (1%)", "Neural (1%)", "Autonym (5%)", "Neural (5%)")

pd3 <- melt(plot_data3)
mix_plot3 <- ggplot(pd3, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#ccbadd","#269441", "#99c2ff")) +
  #scale_fill_brewer(palette="Greens") + 
  ggtitle("File level accuracy for Autonym and Neural Approximate Matching") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(pd3), "files"))
mix_plot3
ggsave(mix_plot3, file = "~/jsnaughty/evaluation/Plots/neuralBoxplot3.png", height= 7.07, width = 9.36, units = "in")

#4 + 5) Is it in the suggestion list (exact vs approximate 1% and 5% moses)
plot_data4<- combinedSize[,c("moses1_suggestion", "neural1_suggestion", "moses5_suggestion", "neural5_suggestion")] 
colnames(plot_data4) <- c("Autonym (1%)", "Neural (1%)", "Autonym (5%)", "Neural (5%)")

pd4 <- melt(plot_data4)
mix_plot4 <- ggplot(pd4, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#ccbadd","#269441", "#99c2ff")) +
  #scale_fill_brewer(palette="Greens") + 
  ggtitle("File level accuracy for Autonym and Neural Approximate Matching") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(pd4), "files"))
mix_plot4
ggsave(mix_plot4, file = "~/jsnaughty/evaluation/Plots/neuralBoxplot4.png", height= 7.07, width = 9.36, units = "in")

plot_data5<- combinedSize[,c("moses1_suggestion_approx", "neural1_suggestion_approx", "moses5_suggestion_approx", "neural5_suggestion_approx")] 
colnames(plot_data5) <- c("Autonym (1%)", "Neural (1%)", "Autonym (5%)", "Neural (5%)")

pd5 <- melt(plot_data5)
mix_plot5 <- ggplot(pd5, aes(variable, y = value))+ 
  geom_boxplot(aes(fill = variable)) +  
  theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
        axis.title = element_text(size=20),
        axis.text.y = element_text(size=20),
        axis.title = element_text(size=20),
        panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
        panel.background = element_rect(fill = "white"),
        legend.position="none") +  
  scale_fill_manual(values = c(	"#afd8b9","#ccbadd","#269441", "#99c2ff")) +
  #scale_fill_brewer(palette="Greens") + 
  ggtitle("File level accuracy for Autonym and Neural Approximate Matching") + 
  xlab("Renaming technique") + 
  ylab(paste("% names recovered -", nrow(pd5), "files"))
mix_plot5
ggsave(mix_plot5, file = "~/jsnaughty/evaluation/Plots/neuralBoxplot5.png", height= 7.07, width = 9.36, units = "in")


#Neural + JsNaughty (Doesn't do any better -> name pool polluted?)
#Remove for now
# subsetNen <- cbind(stats_neural_en[,c("nst_logmodel")])/stats_neural_en[,c("num_loc_names")]
# subsetNen <- cbind(subsetNen, cbind(stats_neural_en[,c("nst_logmodel_all")])/stats_neural_en[,c("num_names")])
# colnames(subsetNen) <- c("Neural", "Neural (All)")
# subsetNen <- as.data.frame(subsetNen)
# subsetNen$file <- as.factor(stats_neural_en$file)
# subset2 <- merge(subset2, subsetNen, by = c("file"))

# stats_neural_lm <- read.csv("~/jsnaughty/evaluation/neural_stats_lm.csv", sep=";")
# stats_neural_freq <- read.csv("~/jsnaughty/evaluation/neural_stats_freq.csv", sep=";")
# summary(stats_neural_lm$nst_lm/stats_neural_lm$num_loc_names)
# table(stats_neural_lm$nst_lm/stats_neural_lm$num_loc_names != 0) #These are worse than the others.  And maybe answers this question (Its not the consistency resolution alg, the exact names just aren't being matched.)
# summary(stats_neural_freq$nst_freqlen/stats_neural_freq$num_loc_names)
# table(stats_neural_freq$nst_freqlen/stats_neural_freq$num_loc_names != 0)
# 
# summary(stats_neural_lm$nst_lm_approx/stats_neural_lm$num_loc_names)
# table(stats_neural_lm$nst_lm_approx/stats_neural_lm$num_loc_names != 0) #These are worse than the others.  And maybe answers this question (Its not the consistency resolution alg, the exact names just aren't being matched.)
# summary(stats_neural_freq$nst_freqlen_approx/stats_neural_freq$num_loc_names)
# table(stats_neural_freq$nst_freqlen_approx/stats_neural_freq$num_loc_names != 0)
# #ks is short for keep same (i.e. keep all the lines, including the ones with no change.)
# stats_neural_ks <- read.csv("~/jsnaughty/evaluation/neural_stats_ks_approx.csv", sep=";")
# 
# summary(stats_neural$nst_logmodel/stats_neural$num_loc_names)
# summary(stats_neural_ks$nst_logmodel/stats_neural_ks$num_loc_names)
# wilcox.test(stats_neural$nst_logmodel/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel/stats_neural_ks$num_loc_names)
# cohensD(stats_neural$nst_logmodel/stats_neural$num_loc_names, stats_neural_ks$nst_logmodel/stats_neural_ks$num_loc_names)
# 
# #Oh, basically it doesn't work at all. Like 19 examples on the better one that recover A name.
# z <- stats_neural[stats_neural$nst_logmodel != 0,]
# z_ks <- stats_neural_ks[stats_neural_ks$nst_logmodel != 0,]
# summary(z$nst_logmodel/z$num_loc_names)
# summary(z_ks$nst_logmodel/z_ks$num_loc_names)
# wilcox.test(z$nst_logmodel/z$num_loc_names, z_ks$nst_logmodel/z_ks$num_loc_names)
# cohensD(z$nst_logmodel/z$num_loc_names, z_ks$nst_logmodel/z_ks$num_loc_names)
# 
# #Let's see how many are approximately matching or approximately matching in the suggestion list
# summary(stats_neural_approx$nst_logmodel_approx/stats_neural_approx$num_loc_names)
# summary(stats_neural_approx$nst_logmodel_approx_maybe/stats_neural_approx$num_loc_names)
# table(stats_neural_approx$nst_logmodel_approx/stats_neural_approx$num_loc_names > 0) #11 files have a possibility actually selected that's not a trivial solution.
# table(stats_neural_approx$nst_logmodel_approx_maybe/stats_neural_approx$num_loc_names > 0) #266 files have a possibility in the list (that isn't an exact match)


#stats_neural_en <- read.csv("~/jsnaughty/evaluation/stats_neural_ensemble.csv", sep=";")

# #Do a maybe version (Just Mixed JsNaughty + US - I don't have it for jsnice.)
# #I think this may be if it was in the candidate list.  Not if the name is an approximate match...
# subset2M <- cbind(stats_mix[,c("hash_def_one_renaming_logmodel_maybe")])/stats_mix[,c("num_loc_names")]
# subset2M <- as.data.frame(subset2M)
# colnames(subset2M) <- c("JSNaughty")
# subset2M$file <- as.factor(stats_mix$file)
# 
# 
# subsetNM <- cbind(stats_neural[,c("nst_logmodel_maybe")])/stats_neural[,c("num_loc_names")]
# colnames(subsetNM) <- c("Neural")
# subsetNM <- as.data.frame(subsetNM)
# subsetNM$file <- as.factor(stats_neural$file)
# subset2M <- merge(subset2M, subsetNM, by = c("file"))
# 
# subset2M <- subset2M[,c("JSNaughty", "Neural")]
# colnames(subset2M) <- c("JSNaughty", "Neural")
# 
# maybe <- melt(subset2M)
# mix_plot3 <- ggplot(maybe, aes(variable, y = value))+ 
#   geom_boxplot(aes(fill = variable)) +  
#   theme(axis.text.x = element_text(size=20, angle = 45, hjust = 1), 
#         axis.title = element_text(size=20),
#         axis.text.y = element_text(size=20),
#         axis.title = element_text(size=20),
#         panel.grid.major.y = element_line(colour = "#f1f1f1", size = 1),
#         panel.background = element_rect(fill = "white"),
#         legend.position="none") +  
#   scale_fill_manual(values = c("#afd8b9","#ccbadd","#269441","#99c2ff", "#003380")) +
#   #scale_fill_brewer(palette="Greens") + 
#   #ggtitle("File level accuracy for JSNaughty and Neural Approximate") + 
#   xlab("Renaming technique") + 
#   ylab(paste("% local names recovered -", nrow(subset2), "files"))
# mix_plot3
# ggsave(mix_plot3, file = "~/jsnaughty/evaluation/Plots/neuralBoxplotLocalMaybe.pdf", height= 7.07, width = 9.36, units = "in")
