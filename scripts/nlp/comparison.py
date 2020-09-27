import pandas as pd
import numpy as np
import nltk
import argparse
import os
import psycopg2
import sys
from sklearn.metrics.pairwise import cosine_similarity
from scipy import sparse
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer

# change here
DATABASE_URL = 'localhost'
PORT = 5432
DATABASE = 'ripple'
USER = 'fliang'
PASSWORD = ''

def myArgsParse():
    parser = argparse.ArgumentParser(description='Create a list of recommended friends')
    parser.add_argument('-u', dest='username', action='store',
                        help='the username to find friends for')

    args = parser.parse_args()
    return args

def getData(args):
    dataDf = None
    try:
        conn = psycopg2.connect(
            host=DATABASE_URL,
            database=DATABASE,
            user=USER,
            password=PASSWORD)
        
        cursor = conn.cursor()
        cursor.execute('''
        (SELECT
            d.userid,
            d.content,
            f.userid1,
            f.userid2
        FROM ripple.description as d
        LEFT JOIN ripple.friend as f
        ON d.userid = f.userid1)
        UNION
        (SELECT
            d.userid, 
            d.content,
            f.userid1,
            f.userid2
        FROM ripple.description as d
        LEFT JOIN ripple.friend as f
        ON d.userid = f.userid2);
        ''')
        dataDf = pd.DataFrame(cursor.fetchall(), columns=['userid', 'content', 'userid1', 'userid2'])
        dataDf = dataDf.drop_duplicates()
        dataDf = dataDf[(dataDf.userid1 != args.username) & (dataDf.userid2 != args.username)]
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
        return dataDf

def formatData(args, df):
    # if the input dataframe has no data, return
    if df is None:
        return
    
    # get index of user
    index = df[df.userid == args.username].index[0]
    
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

    # to account for the person themselves
    NUM_TOP_SUGGESTED_FRIENDS = 4
    NUM_TOP_SUGGESTED_FRIENDS += 1

    threshold = 0.2
    indicies = np.argpartition(similarities[index], -NUM_TOP_SUGGESTED_FRIENDS)[-NUM_TOP_SUGGESTED_FRIENDS:]
    
    # remove the original user
    indicies = indicies[indicies != index]
    
    potentialFriends = df.iloc[indicies]
    potentialFriends = potentialFriends[['userid', 'content']]
    result = potentialFriends.to_json(orient="records")
    print(result)


# install nltk packages
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

args = myArgsParse()
dataDf = getData(args)
formatData(args, dataDf)