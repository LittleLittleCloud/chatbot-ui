// Copyright (c) Microsoft. All rights reserved.

using System.Text.Json.Nodes;
using Azure.Storage.Blobs;
using Backend.PromptTemplate;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel.AI.TextCompletion;
using Microsoft.SemanticKernel.Orchestration;
using Microsoft.SemanticKernel.SemanticFunctions;
using Microsoft.SemanticKernel.TemplateEngine;

namespace Backend.Controllers;

[ApiController]
public class ChatController : Controller
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly BlobContainerClient _blobContainerClient;
    private readonly Dictionary<string, ITextCompletion> _textCompletionFactory = new Dictionary<string, ITextCompletion>();

    public ChatController(
        BlobServiceClient blobServiceClient, 
        BlobContainerClient blobContainerClient,
        Dictionary<string, ITextCompletion> textCompletionFactory)
    {
        this._blobServiceClient = blobServiceClient;
        this._blobContainerClient = blobContainerClient;
        this._textCompletionFactory = textCompletionFactory;
    }

    [HttpPost]
    [Route("chat")]
    [Produces("application/json")]
    public async Task<IActionResult> PostChatAsync([FromBody]ChatRequest chat)
    {
        if(chat.From is string userID
            && chat.To is string modelID
            && chat.Messages is Message[] messages
            && this._textCompletionFactory.TryGetValue(modelID, out var textCompletion))
        {
            var prompt = new ChatTemplate()
            {
                ModelName = modelID,
                UserName = userID,
                Messages = messages,
            }.TransformText();
            Console.WriteLine(prompt.ToString());
            // todo: get settings from user profile
            var requestSettings = new CompleteRequestSettings
            {
                Temperature = 0.5,
                FrequencyPenalty = 0.5,
                PresencePenalty = 0.0,
            };

            // TODO: update token in user profile
            var response = await textCompletion.CompleteAsync(prompt, requestSettings);
            return this.Ok(new ChatResponse(new Message(modelID, response), 100));
        }
        else
        {
            return this.BadRequest();
        }
    }
}
