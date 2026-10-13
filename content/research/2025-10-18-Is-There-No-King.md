---
book_reference: true
categories:
- Vibe Coding
date: 2025-10-18 01:42:44 -0500
description: null
layout: post
tags:
- Vibe Coding
- RAG
- Those Who Look In the Void the Void Looks Into You
title: Is There No King? Or Is NodeRAG King?
wiki_references: ["embeddings", "local-inference", "ollama", "rag", "sentence-transformers"]
---

First thought. How do I install this?

<br>

```
git clone https://github.com/Terry-Xu-666/NodeRAG
```

<br>

Yeah, but do I even know how I start something like this?

No.

Where is the Package.json?

Guess I will vibe install.

So for this post I am including all my prompts, except for the ones that are just copy/pasting errors until it fixes itself.

OK, so it is cloned I guess I type something into CLIne to start this because I have no clue.

<br>

```
Start this application
```

<br>

![Image](/images/101801.png)

<br>

Oh, you read the README.md first.

Well that makes sense.

It is running now at least. I did not learn how to run it, but it works and that is all that matters right???

<br>

![Image](/images/101802.png)

<br>

Well I can already tell this is not going to work.

You know why?

<br>

![Image](/images/101803.png)

<br>

I refuse to pay "Closed"AI anything. I am not going to pay for this. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for anything. I am not going to pay for srry my cat walked on my tab key.

So what am I going to do now? How am I going to know if there is a king if I can't run this for free? I know I could use Gemini or any other freely available model on OpenRouter or HuggingFace or anywhere else but I want to do a lot of work on a lot of documents and I really want to be able to run absolutely everything local so I think this is what I am going to do:

### Converting NodeRAG to Use Local Inference

Ok so I have no clue what I am doing. How would I even do that?

I guess I have Ollama running still I could use that. I have granite4-mirco-h or whatever that less than 2GB model installed which is what I am going to use but I should really use a small Qwen model most likely for testing purposes. For my final purpose I can use a better model but for now I just need to see if I can get it to work.

I guess I will just write a prompt and see if CLIne can one shot it. It is simple enough. I know I know, it is just editing the parameters under model_config but I am trying to do this with as little thought as possible, it has just been one of those days.

<br>

```
I want this to work with Ollama man. I don't want to pay ANYTHING for this. I want all the inference done locally. So could you pretty please with sugar on top change the code to use Ollama and the granite4-micro-h model? Or at least just add it under model_config so I can try it out. Also I want to use the nomic-embed-text model for the embeddings.
```

<br>

<br>

![Image](/images/101804.png)

<br>

![Image](/images/101805.png)

<br>

Hmm, how many braincells do I have left now? 

<br>

![Image](/images/101806.png)
<br>

OK well it did more than I would have done. But remember I am an idiot. I would have just changed the values in the config file without adding classes to LLM.py or updating the routing or changing the dimensions of the embeddings. Also I would have probably ran into needing to installing the ollama dependency so that needed changed as well.

Now let's see if it works.

<br>

![Image](/images/101807.png)

<br>

Ok, well I am talking to Grok here as he is free on CLIne right now. Maybe I need to talk to it in a way it will understand?

<br>

```
Make App Great Again!
```

<br>

![Image](/images/101808.png)

<br>

Well that did not work. I guess I need to try something more realistic.
<br>

```
Make App Great For the First Time Because It Is Realistic To Admit That There Is Always Room For Improvement and We Should Not Worship the Past But Think of Our Future
```

<br>    

![Image](/images/101809.png)

<br>

![Image](/images/101810.png)

<br>

I am sorry maker of this repo if you are reading this. I am sure you are very disappointed in me. I am sure I have done some bastardization and even if I do get it to work at this point I am just churning out more and more bloat slop code. I am sure you are thinking that I am a terrible person.

<br>

![Image](/images/101811.png)

<br>

![Image](/images/101812.png)

<br>

God the maker of this is going to hunt me down for this if nothing else than to make me feel bad. I am sure I am going to get a call from the FBI warning me again about something. That happened actually. Some people were out to get me and the FBI called to warn me first. That was nice of them. It did not stop a mob of people breaking my door down at midnight one night and I had to fight them all off with a chef's knife, but hey, what's the worst that could happen?

<br>

```
I want this work with ollama : 
File "/Users/danielkliewer/NodeRAG01/NodeRAG/NodeRAG/WebUI/app.py", line 872, in <module>
    sidebar()
File "/Users/danielkliewer/NodeRAG01/NodeRAG/NodeRAG/WebUI/app.py", line 515, in sidebar
    index=["openai",'gemini'].index(st.session_state.model_config['service_provider']),
```

<br>

Ok maybe if I just ask it nicely and paste the error message...

<br>

![Image](/images/101813.png)

<br>

![Image](/images/101814.png)

<br>

Well at least the error changed.

Hmm should I read it this time?

Nah, COPY PASTE THE ERRORS TILL FIXED!!!

<br>

```
2025-10-18 11:12:32.779 Uncaught app execution
Traceback (most recent call last):
  File "/Users/danielkliewer/NodeRAG01/NodeRAG/.venv/lib/python3.10/site-packages/streamlit/runtime/scriptrunner/exec_code.py", line 121, in exec_func_with_error_handling
    result = func()
  File "/Users/danielkliewer/NodeRAG01/NodeRAG/.venv/lib/python3.10/site-packages/streamlit/runtime/scriptrunner/script_runner.py", line 593, in code_to_exec
    exec(code, module.__dict__)
  File "/Users/danielkliewer/NodeRAG01/NodeRAG/NodeRAG/WebUI/app.py", line 878, in <module>
    sidebar()
  File "/Users/danielkliewer/NodeRAG01/NodeRAG/NodeRAG/WebUI/app.py", line 576, in sidebar
    index=["openai_embedding","gemini_embedding"].index(st.session_state.embedding_config['service_provider']),
ValueError: 'ollama_embedding' is not in list
```

<br>

![Image](/images/101816.png)

<br>

![Image](/images/101815.png)

<br>

Well that solved that. Oh wait, what is that error? Does it mean anything? Should I test what I have now? Nah, I'll just copy paste this error and see if that will fix things pre-emptively because we all know pre-emptive strikes are the only real way to do things.

<br>

```
❌ An error occurred while processing your request: ChatMixin.chat_input() got multiple values for argument 'placeholder'
```

<br>

![Image](/images/101817.png)

<br>

![Image](/images/101818.png)

<br>

Woohoo! No errors.
Do I have any idea what I did? Did I FUBAR this app? Let's see if this will work.

<br>

![Image](/images/101819.png)

<br>

Well...
Maybe I should start over and this time not Vibe-Install it.

<br>

So tootaloo I am going to try this again in a new post. This post is my shit post. I keep saying that. The next one will actually work right???









