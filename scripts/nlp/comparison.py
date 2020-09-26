import pandas as pd
import numpy as np
import nltk
from sklearn.metrics.pairwise import cosine_similarity
from scipy import sparse
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer

def formatData():
    df = pd.read_csv('raw_data.tsv', sep='\t')

    # remove puntuation
    df['content'] = df['content'].str.replace('[^\w\s]','')

    # tokenization of paragraphs
    df['tokens'] = df['content'].apply(nltk.word_tokenize)

    # lowercase all words
    df['tokens'] = df['tokens'].apply(lambda lst: [word.lower() for word in lst])

    # remove stopwords
    df['tokens'] = df['tokens'].apply(lambda lst: [word for word in lst if not word in stopwords.words()])

    # apply lemmenization
    stemmer = SnowballStemmer('english')
    df['tokens'] = df['tokens'].apply(lambda lst: ' '.join([stemmer.stem(word) for word in lst]))

    # tf-idf vectorizer
    vectorizer = TfidfVectorizer()
    featureVectors = vectorizer.fit_transform(df.tokens)

    # compute cosine similarity
    similarities = cosine_similarity(featureVectors)
    print(similarities)

    numTopSuggestedFriends = 3
    # to account for the person themselves
    numTopSuggestedFriends += 1

    threshold = 0.2
    # output data
    with open('output.tsv', 'w') as f:
        matrixLen = len(similarities)
        if (matrixLen > 0):
            for i in range(matrixLen):
                ind = np.argpartition(similarities[i], -numTopSuggestedFriends)[-numTopSuggestedFriends:]
                
                f.write('{content}\n'.format(content=df.iloc[i]['content']))
                for j in ind[ind != i]:
                    score = similarities[i][j]
                    if score >= threshold:
                        f.write('{score} | {content}'.format(score=similarities[i][j], content=df.iloc[j]['content']))
                f.write('\n\n')
        f.close()         

if __name__ == '__main__':
    # install nltk packages
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt')
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords')
    formatData()