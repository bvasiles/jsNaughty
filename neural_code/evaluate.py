from model.data_utils import CoNLLDataset
from model.ner_model import NERModel
from model.config import Config
import sys

def align_data(data):
    """Given dict with lists, creates aligned strings

    Adapted from Assignment 3 of CS224N

    Args:
        data: (dict) data["x"] = ["I", "love", "you"]
              (dict) data["y"] = ["O", "O", "O"]

    Returns:
        data_aligned: (dict) data_align["x"] = "I love you"
                           data_align["y"] = "O O    O  "

    """
    spacings = [max([len(seq[i]) for seq in data.values()])
                for i in range(len(data[list(data.keys())[0]]))]
    data_aligned = dict()

    # for each entry, create aligned string
    for key, seq in data.items():
        str_aligned = ""
        for token, spacing in zip(seq, spacings):
            str_aligned += token + " " * (spacing - len(token) + 1)

        data_aligned[key] = str_aligned

    return data_aligned



def interactive_shell(model):
    """Creates interactive shell to play with model

    Args:
        model: instance of NERModel

    """
    model.logger.info("""
This is an interactive mode.
To exit, enter 'exit'.
You can enter a sentence like
input> I love Paris""")

    while True:
        try:
            # for python 2
            sentence = raw_input("input> ")
        except NameError:
            # for python 3
            sentence = input("input> ")

        words_raw = sentence.strip().split(" ")

        if words_raw == ["exit"]:
            break

        preds = model.predict(words_raw)
        to_print = align_data({"input": words_raw, "output": preds})

        for key, seq in to_print.items():
            model.logger.info(seq)


def web_setUp():
    """Sets up the model intially for reusing in consecutive requests.

    Returns:
        model or None: The neural model or None if something goes wrong.
    """
    model = None
    # create instance of config
    config = Config()

    # build model
    model = NERModel(config)
    model.build()
    model.restore_session(config.dir_model)

    return model


def web_predict(model, filename):
    """Gives the prediction for the given filename and Neural model.

    Args:
        model: The neural model.
        filename: The name of the file to be used for prediction.

    Returns:
        list. A list of predictions.

    Note: We tried to use string as input.
    it caused with semicolons. a = 2 ; b = 3
    was interpreted as a = 2. To overcome this,
    we were supposed to replace ; with %3B. An
    easier workaround was to use temp files.
    We are using temp files.
    """
    file = open(filename, 'r')
    testString = file.read()
    file.close()
    #testString = input_string
    test_sentences = testString.split("\n")
    print (test_sentences)
    test_sentences = filter(lambda z: z, test_sentences)
    label_preds = []
    for sentence in test_sentences:
        label_pred = model.predict(sentence.split())
        label_preds += label_pred

    return label_preds


def main():
    # create instance of config
    config = Config()

    # build model
    model = NERModel(config)
    model.build()
    model.restore_session(config.dir_model)

    # create dataset
    test  = CoNLLDataset(config.filename_test, config.processing_word,
                         config.processing_tag, config.max_iter)

    # evaluate and interact
    # model.evaluate(test)
    #label_preds, seq_lengths = model.predict_batch(test)
    #interactive_shell(model)a
	
    #testfile = config.filename_test
    if len(sys.argv) > 0:
        testfile = sys.argv[1]
        f = open(testfile, 'r')
        testString = f.read()
        #testString = sys.argv[1]
        #f.close()

    test_sentences = testString.split("\n")
    test_sentences = filter(lambda z: z, test_sentences)
        #print test_sentences

    print("\n\n")

    label_preds = []
    print("<start>")
    for sentence in test_sentences:
        #print(sentence)
        label_pred = model.predict(sentence.split())
        print(' '.join(label_pred))
        label_preds += label_pred
        #print()


if __name__ == "__main__":
    main()
