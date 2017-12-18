from model.data_utils import CoNLLDataset
from model.ner_model import NERModel
from model.config import Config
from datetime import datetime

def main():
    # create instance of config
    config = Config()

    # build model
    model = NERModel(config)
    model.build()
    # model.restore_session("results/crf/model.weights/") # optional, restore weights
    # model.reinitialize_weights("proj")

    # create datasets
    dev   = CoNLLDataset(config.filename_dev, config.processing_word,
                         config.processing_tag, config.max_iter)
    train = CoNLLDataset(config.filename_train, config.processing_word,
                         config.processing_tag, config.max_iter)

    # train model
    starttime = datetime.now()
    model.train(train, dev)
    endtime = datetime.now()
    
    with open('results/timelog.txt', 'w') as f:
        f.write('Time taken: {} for {}'.format(endtime - starttime, config.filename_train))

if __name__ == "__main__":
    main()
